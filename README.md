# Real-Time-Task-Employee-Management-Tool

1. How to run this app
* Create a firebase project
* Download Service Account Key: open Project settings > Service accounts for your project. Click Generate New Private Key, then confirm by clicking Generate Key
* Put serviceAccountKey.json in /backend/config
* Setup .env file:
  * PORT=5000
  * NODE_ENV=development
  * ACCESS_TOKEN_SECRET=accesstokensecret
  * REFRESH_TOKEN_SECRET=refreshtokensecret
  * APP_PASSWORD=yourapppassword
  * MY_EMAIL=youremail
  * CLIENT_LOGIN_URL=http://localhost:3000/login
  * CLIENT_URL=http://localhost:3000
* Install dependency:
  - npm i
  - cd frontend => npm i
2. Screenshots
* Login
  Users can log in by email and verify access code through their email.
  ![image](https://github.com/user-attachments/assets/068883d6-a622-47dc-9f0c-4cfe2b446506)
  ![image](https://github.com/user-attachments/assets/fb47c3a6-490e-4832-8f79-d2ed3064065f)
  ![image](https://github.com/user-attachments/assets/e4754c55-6d53-44a4-89d9-a5b617ee4312)
  
* Dashboard (Owner)
  * Manage Employee
    Owner can create, edit, delete employees.
  ![image](https://github.com/user-attachments/assets/bde000d0-6367-40f0-848e-5e530e83d191)
  ![image](https://github.com/user-attachments/assets/8b7e7a36-69a7-4112-a2c0-d9f91aafe9f2)

  * Manage Task
    Owner can create, edit, delete tasks.
  ![image](https://github.com/user-attachments/assets/283eee22-036a-4825-b851-2c0e26c56dce)
  ![image](https://github.com/user-attachments/assets/11237cc1-7c1a-4fd6-92e4-e406ef3ea729)

* Dashboard (Employee)
  * Change Task Status
    Employe can change their status of tasks.
  ![image](https://github.com/user-attachments/assets/a59b9d0c-a5cc-483e-89c0-55748e52e6d9)
  ![image](https://github.com/user-attachments/assets/fba3817b-25e5-43ce-8149-495ebe543c8e)

  * Edit Profile
    Employee can edit their profile.
  ![image](https://github.com/user-attachments/assets/b49fd630-7d27-497b-bc68-32e45665fb65)
  ![image](https://github.com/user-attachments/assets/eae44732-d23e-4278-ab1a-52972fb835d8)
  ![image](https://github.com/user-attachments/assets/5af0af00-34b0-4c16-8812-5fbd35cefa4f)

* Message
  Owner and employee can chat in real-time.
  ![image](https://github.com/user-attachments/assets/24399845-b2d3-43f1-84c4-2a20e02cc439)
  ![image](https://github.com/user-attachments/assets/36883c3a-81d4-4a42-ab63-6dcc44c629e6)
  ![image](https://github.com/user-attachments/assets/6e9bd558-8e4b-44f6-a765-401b2322f8f8)
  
* Logout
  ![image](https://github.com/user-attachments/assets/19de16bc-a569-4dc4-b3fb-eb363af40747)




  






