
import win32com.client as win32
from typing import List, Optional

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
        mail.HTMLBody = body

        # Add attachments if provided
        if attachments:
            for attachment in attachments:
                mail.Attachments.Add(attachment)

        # Display the email (don't send automatically)
        mail.Display()

    except Exception as e:
        print(f"Error creating Outlook email: {str(e)}")
        raise
