@echo off
CD /D "%~dp0"
call cd NCUACG
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo Virtual environment activated.
echo Starting Django server...
echo ciallo~(∠・ω< )⌒☆
python manage.py runserver
echo Django server command executed.