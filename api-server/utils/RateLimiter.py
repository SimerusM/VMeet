from collections import defaultdict, deque
from .Debugger import Debugger
import time

class RateLimiter:
    __user_chat_timestamps = defaultdict(deque) # Dict to log chat request timestamps per user for rate limiting --> {user_id: [timestamp1, timestamp2, ...]}
    __meeting_user_count = defaultdict(int) # A dictionary to track the number of users in each meeting currently --> {meeting_id: user_count}

    def __init__(self, max_chat_requests_per_user: int, max_users_per_meeting: int, rate_limit_time_window: int):
        self.max_chat_requests_per_user = max_chat_requests_per_user # The maximum number of chat requests allowed per user within a specific time window
        self.max_users_per_meeting = max_users_per_meeting # The maximum number of users allowed to join a meeting at once
        self.rate_limit_time_window = rate_limit_time_window # The time frame within which the rate limiting is applied for chat requests (seconds)

    def updateMeetingCount(self, meeting_id: str, action: str) -> None:
        """
        Function to update in-memory data structure on head counts in meetings
        """
        if action == "join":
            self.__meeting_user_count[meeting_id] += 1
            Debugger.log_message(Debugger.DEBUG, f"Meeting count: {self.__meeting_user_count[meeting_id]}")
        elif action == "leave":
            self.__meeting_user_count[meeting_id] -= 1
            Debugger.log_message(Debugger.DEBUG, f"Meeting count: {self.__meeting_user_count[meeting_id]}")
        else:
            raise ValueError(f"Invalid action: {action}. Expected 'join' or 'leave'.")

    def rateLimitChat(self, username: str) -> bool:
        """
        Checks if a user has exceeded their chat rate limit.

        This method:
        1. Adds the current timestamp to the user's chat history.
        2. Removes outdated timestamps outside the rate limit window.
        3. Checks if the number of recent messages exceeds the allowed limit.

        Args:
            username (str): The username to check.

        Returns:
            bool: True if the user is within the rate limit, False otherwise.
        """
        curr_time = time.time()
        self.__user_chat_timestamps[username].append(curr_time)

        Debugger.log_message(Debugger.DEBUG, f"User chat timestamps: {self.__user_chat_timestamps[username]}")
        # Remove redundant time stamps
        while curr_time - self.__user_chat_timestamps[username][0] > self.rate_limit_time_window:
            self.__user_chat_timestamps[username].popleft()
        Debugger.log_message(Debugger.DEBUG, f"User chat timestamps: {self.__user_chat_timestamps[username]}")
        
        # Chat rate limit check
        if len(self.__user_chat_timestamps[username]) > self.max_chat_requests_per_user:
            return True
        
        return False



    
    

    
    