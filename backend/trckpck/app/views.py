from django.shortcuts import render
from django.http import HttpResponse, JsonResponse



def data_dump(request):
    data = {
        'test':123
    }
    return JsonResponse(data)
