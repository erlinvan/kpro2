from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import boto3



def data_dump(request):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table('test_table')
    data = table.scan()
    items = data.get('Items', [])

    return JsonResponse(items, safe=False)
