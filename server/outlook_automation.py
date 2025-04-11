import win32com.client as win32
import sys
import json
import base64
from PIL import ImageGrab
import io

def create_outlook_email(data):
    try:
        # Parse input data
        data = json.loads(data)
        recipients = data.get('recipients', '')
        subject = data.get('subject', '')
        body = data.get('body', '')
        attachments = data.get('attachments', [])

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

        # Display the email (opens draft)
        mail.Display()

        return json.dumps({
            'success': True,
            'message': 'Email draft created successfully'
        })

    except Exception as e:
        return json.dumps({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    if len(sys.argv) > 1:
        result = create_outlook_email(sys.argv[1])
        print(result)
    else:
        print(json.dumps({
            'success': False,
            'error': 'No data provided'
        }))