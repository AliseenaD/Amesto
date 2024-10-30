from django.http import JsonResponse
from django.conf import settings
import requests
from zeep import Client

# Class that begins to implement the Zarinpal for payment processing
class ZarinpalPayment:
    def __init__(self):
        self.MERCHANT = 'INSERT MERCHANT CODE HERE'
        self.client = Client('https://www.zarinpal.com/pg/services/WebGate/wsdl')
        self.amount = 0
        self.callback_url = 'Insert callback url for site here'

    # Sends payment request to zarinpal 
    def send_request(self, amount, description, email, mobile):
        self.amount = amount
        result = self.client.service.PaymentRequest(
            self.MERCHANT,
            self.amount,
            description,
            email,
            mobile,
            self.callback_url
        )

        if result.Status == True:
            return {'status': 'success', 'url': f'https://www.zarinpal.com/pg/StartPay/{result.Authority}'}
        else:
            return {'status': 'error', 'code': result.Status}