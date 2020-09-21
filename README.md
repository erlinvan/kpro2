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
* Trykk start øverst i høyre hjørne. Applikasjonen din skal nå kjøre på http://127.0.0.1:8000

## Alternativ for å utvikle lokalt
* Klon prosjektet
* åpne mappen i terminalen

```
theodorc@mycomputer: virtualenv venv && source venv/bin/activate
(venv)theodorc@mycomputer: pip install -r requirements_dev.txt
(venv)theodorc@mycomputer: python manage.py runserver
```

## Oppsett AWS-integrasjon
* 'pip install awscli' hvis du ikke har det
* Kjør 'aws configure'
* Bruk 'Access key ID' og 'Secret access key' som Theodor sendte til deg personlig på Slack
* Restart applikasjonen
