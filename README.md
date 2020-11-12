# kpro2
 Customer Driven Project - Group 2

# Backend

## How to develop locally
* Clone the project
* Open the project in your preferred terminal
```
theodorc@mycomputer kpro2/backend: cd backend
theodorc@mycomputer kpro2/backend: virtualenv venv && source venv/bin/activate
(venv)theodorc@mycomputer kpro2/backend: pip install -r requirements_dev.txt
(venv)theodorc@mycomputer kpro2/backend: python manage.py migrate
(venv)theodorc@mycomputer kpro2/backend: python manage.py initdb // this populates the localdb with some test data
(venv)theodorc@mycomputer kpro2/backend: python manage.py runserver
```
* Your application is now available at http://localhost:8000

##  AWS setup
To run the backend you need the correct privileges to connect to the DynamoDB instance
* Install aws-cli for your system
```
theodorc@mycomputer: aws configure
```
* User 'Access key ID' and 'Secret access key' supplied to you by Theodor on Slack
* Restart the application

## How to deploy the backend
* Ask Theodor for access to the EC2 instance

```
theodorc@mycomputer kpro2/backend: ssh -i your_priv_key.pem ubuntu@34.251.202.233 './deploy.sh'
```

# Frontend

## How to develop locally in Visual Studio Code
* clone the project
* Open the frontend folder in VScode

```
erlinvan@mycomputer: npm install
erlinvan@mycomputer: npm start
```
* The project will be available at http://127.0.0.1:3000

## Netlify
Netlify is configured to automatically deplopy changes from the main branch. Every PR will also get a test site. 

Status of the project on Netlify is:
[![Netlify Status](https://api.netlify.com/api/v1/badges/2eebe088-c242-41a6-ac44-052c7b5edb4c/deploy-status)](https://app.netlify.com/sites/trckpck/deploys)
