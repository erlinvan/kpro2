# kpro2
Kundestyrt prosjekt gruppe 2

# Backend

## Hvordan utvikle lokalt i pycharm
* Klon prosjektet
* Åpne backend-mappa i pycharm
* Sett interpreter i File->Settings->Project->Project Interpreter->Tannhjul->Add
  * Lag et nytt virtual environment, pass på at den ligger i backend
* Lag en configuration. Run->Edit configuration
* Velg venv du lagde i Python interpreter
* Dobbeltsjekk at Environment variables er satt til 'trckpck.settings'
* Åpne requirements.txt, og trykk 'Install requirements'
```
(venv)theodorc@mycomputer: python manage.py migrate
(venv)theodorc@mycomputer: python manage.py initdb
```
* Trykk start øverst i høyre hjørne. Applikasjonen din skal nå kjøre på http://127.0.0.1:8000

## Alternativ for å utvikle lokalt
* Klon prosjektet
* åpne mappen i terminalen
```
theodorc@mycomputer: cd backend
theodorc@mycomputer: virtualenv venv && source venv/bin/activate
(venv)theodorc@mycomputer kpro2/backend: pip install -r requirements_dev.txt
(venv)theodorc@mycomputer: python manage.py migrate
(venv)theodorc@mycomputer: python manage.py initdb // this populates the localdb with some test data
(venv)theodorc@mycomputer: python manage.py runserver
```

## Oppsett AWS-integrasjon
```
theodorc@mycomputer: aws configure
```
* Bruk 'Access key ID' og 'Secret access key' som Theodor sendte til deg personlig på Slack
* Restart applikasjonen

## Hvordan deploye backend
```
theodorc@mycomputer kpro2/backend: eb deploy
theodorc@mycomputer kpro2/backend: eb status // This will report the status of our elastic beanstalk instance
```

# Frontend

## Netlify

Netlify er konfigurert til å automatisk deploye når endringer skjer på main-branch. I tillegg deployes en testside for hver pull request.

Status til prosjektet på Netlify er:
[![Netlify Status](https://api.netlify.com/api/v1/badges/2eebe088-c242-41a6-ac44-052c7b5edb4c/deploy-status)](https://app.netlify.com/sites/trckpck/deploys)
