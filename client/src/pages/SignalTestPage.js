import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const SERVER_URL = 'http://127.0.0.1:5000';

const SignalingTestPage = () => {
  const { meeting_id } = useParams(); // Get the meeting ID from the URL
  const [socket, setSocket] = useState(null);
  const [peerConnections, setPeerConnections] = useState({}); // Track all peer connections

  // Function to create or retrieve a peer connection for a participant
  const createOrGetPeerConnection = useCallback(
    (participantId) => {
      if (peerConnections[participantId]) {
        return peerConnections[participantId]; // Return existing connection if it exists
      }

      // Create a new peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', { meeting_id, candidate: event.candidate });
        }
      };

      // Store the new peer connection
      setPeerConnections((prev) => ({
        ...prev,
        [participantId]: pc,
      }));

      return pc;
    },
    [peerConnections, socket, meeting_id]
  );

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, [meeting_id]);

  useEffect(() => {
    if (!socket) return;

    // Handle incoming SDP offer
    socket.on('offer', async (data) => {
      const { participant_id, sdp } = data;
      const pc = createOrGetPeerConnection(participant_id);

      if (pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', { meeting_id, sdp: answer });
      } else {
        console.warn(`Ignoring offer as the connection is in stable state: ${pc.signalingState}`);
      }
    });

    // Handle incoming SDP answer
    socket.on('answer', async (data) => {
      const { participant_id, sdp } = data;
      const pc = peerConnections[participant_id];
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } else {
        console.warn(`Ignoring answer as the connection is in state: ${pc?.signalingState}`);
      }
    });

    // Handle incoming ICE candidates
    socket.on('ice_candidate', async (data) => {
      const { participant_id, candidate } = data;
      const pc = peerConnections[participant_id];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding received ICE candidate', error);
        }
      }
    });

    // Joining the room (signaling)
    socket.emit('join', { username: 'test', meeting_id: meeting_id });

    // Test: Create an SDP offer if this client is the one initiating the call
    const createOffer = async () => {
      const pc = createOrGetPeerConnection('initiator');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('offer', { meeting_id, sdp: offer });
    };

    // Automatically create an offer when the page loads (you can control this logic as needed)
    createOffer();

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
    };
  }, [socket, peerConnections, createOrGetPeerConnection, meeting_id]);

  return (
    <div>
      <h1>Signaling Test Page for Meeting: {meeting_id}</h1>
      <p>Open this page in multiple tabs to test SDP and ICE exchange.</p>
    </div>
  );
};

export default SignalingTestPage;
