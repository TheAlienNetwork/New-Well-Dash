
import win32com.client as win32
from typing import List, Optional
from PIL import ImageGrab
import base64
import io
import time

def create_outlook_email(
    recipients: str,
    subject: str,
    body: str,
    attachments: Optional[List[str]] = None
) -> None:
    try:
        # Initialize Outlook
        outlook = win32.Dispatch('Outlook.Application')
        mail = outlook.CreateItem(0)  # 0 = Mail item

        # Set email properties
        mail.To = recipients
        mail.Subject = subject
        
        # Set the HTML body
        mail.HTMLBody = body

        # Add attachments if provided
        if attachments:
            for attachment in attachments:
                mail.Attachments.Add(attachment)

        # Display the email
        mail.Display()
        
        # Give Outlook time to open the window
        time.sleep(1)
        
        # Get the active window handle for the email
        outlook_window = win32.GetObject(None, "Outlook.Application").ActiveWindow()
        
        # Move window to foreground
        outlook_window.Activate()
        
        # Give a moment for the window to activate
        time.sleep(0.5)
        
        # Capture screenshot of the email window
        screenshot = ImageGrab.grab(bbox=(
            outlook_window.Left, 
            outlook_window.Top,
            outlook_window.Left + outlook_window.Width,
            outlook_window.Top + outlook_window.Height
        ))
        
        # Convert screenshot to base64
        buffer = io.BytesIO()
        screenshot.save(buffer, format='PNG')
        screenshot_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'success': True,
            'screenshot': screenshot_base64
        }

    except Exception as e:
        print(f"Error creating Outlook email: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
