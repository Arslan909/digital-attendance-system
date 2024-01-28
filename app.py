from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import json
# import sys
# import csv


app = Flask(__name__)

app.secret_key = 'your_secret_key'

# class_name = ''

@app.route("/")
def index():
    return render_template("entrance.html")


@app.route("/authenticate", methods=["POST"])
def authenticate():
    data = request.get_json()
    # global class_name
    class_name = data.get("class")
    uName = data.get("username")
    pwd = data.get("password")
    
    
    class_data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
    class_json_path = os.path.join(class_data_dir, f"{class_name}.json")

    if os.path.exists(class_json_path):
        session['class_name'] = class_name
        class_name = class_name.lower()

        class_data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
        class_json_path = os.path.join(class_data_dir, f"{class_name}.json")

        facultyAuth_dir = os.path.join(app.root_path, "static", "data", "auth", "facultySignup.json")
        studentAuth_dir = os.path.join(app.root_path, "static", "data", "auth", "studentsignup.json")

        if os.path.exists(class_json_path):
            with open(facultyAuth_dir, "r") as json_file:
                facultySignup_data = json.load(json_file)
                for usersInfo in facultySignup_data:
                    if usersInfo["username"] == uName and usersInfo["password"] == pwd:
                        return redirect(url_for("attendanceExtra"))
                    
            with open(studentAuth_dir, "r") as json_file:
                studentSignup_data = json.load(json_file)
                for usersInfo in studentSignup_data:
                    if usersInfo["username"] == uName and usersInfo["password"] == pwd and usersInfo["class"] == class_name:
                        return redirect(url_for("profile", student_name=usersInfo["name"], rollnumber=usersInfo["rollnumber"], class_name=class_name))

        return "Authentication failed"
    else:
        return "Class not found"


@app.route("/className", methods=["GET"])
def className():
    class_name = session.get('class_name')
    return jsonify(class_name)



@app.route("/attendanceExtra", methods=["GET"])
def attendanceExtra():
    # class_name = request.args.get('class_name')
    # class_name = class_name.lower()

    # class_data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
    # class_json_path = os.path.join(class_data_dir, f"{class_name}.json")

    # if os.path.exists(class_json_path):
    return render_template("attendance1.html")
    # else:
    #     return "Class not found"


@app.route("/profile")
def profile():
    class_name = request.args.get('class_name')
    student_name = request.args.get('student_name')
    rollnumber = request.args.get('rollnumber')
    return render_template("profile.html", class_name=class_name, student_name=student_name, roll_number = rollnumber)



# mark attendance button(attendance.js) will send request to this route to get data (ps-for the selected date)
@app.route("/get_data", methods=["POST"])
def get_data():
    request_data = request.get_json()
    className = request_data.get("className")
    date_to_match = request_data.get("date")
    # print(className)

    # checking in the attendance record folder first 
    attendance_data_dir = os.path.join(app.root_path, "static", "data", "attendanceRecord")
    attendance_json_path = os.path.join(attendance_data_dir, f"{className}_attendance_record.json")

    if os.path.exists(attendance_json_path):
        with open(attendance_json_path, "r") as json_file:
            attendance_data = json.load(json_file)
            
            for entry in attendance_data:
                if entry[0][0] == date_to_match:
                    # print(date_to_match)
                    # print(entry[0][1:])
                    return jsonify(entry[0][1:])
                
    # if the record is not in the attendance record (means new class with no previous response is present) we will get the data of student from the class record folder
    class_data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
    class_json_path = os.path.join(class_data_dir, f"{className}.json")

    if os.path.exists(class_json_path):
        with open(class_json_path, "r") as json_file:
            class_data = json.load(json_file)
            
            return jsonify(class_data)

    return jsonify([])


@app.route("/month_report_page", methods=["GET"])
def month_report_page():
    # class_name = request.args.get("class_name")
    return render_template("report.html")


@app.route("/percentage_report_page", methods=["GET"])
def percentage_report_page():
    class_name = request.args.get("class_name")
    return render_template("percentage_report.html")



@app.route('/report_data', methods=['POST'])
def report_data():
    request_data = request.get_json()
    className = request_data.get("className")
    # class_name = request.args.get("class")
    print(className)
    attendance_data_dir = os.path.join(app.root_path, "static", "data", "attendanceRecord")
    attendance_json_path = os.path.join(attendance_data_dir, f"{className}_attendance_record.json")

    if os.path.exists(attendance_json_path):
        with open(attendance_json_path, "r") as json_file:
            attendance_data = json.load(json_file)
            # print(attendance_data)
            return jsonify(attendance_data)
    return jsonify([])



@app.route("/form_page", methods=["GET"])
def form_page():
    class_name = request.args.get("class_name")
    return render_template("form1.html")



@app.route("/submit", methods=["POST"])
def submit():
    data = {
        "name": request.form.get("name"),
        "rollNumber": request.form.get("rollNumber"),
        "class": request.form.get("CLASS"),
    }
    filename = data["class"]
    
    save_data(data, filename)

    return jsonify({"message": "student data stored successfully"})

def save_data(data, filename):# this is function for saving any new student in its respected class record
    data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
    os.makedirs(data_dir, exist_ok=True)
    json_path = os.path.join(data_dir, filename + ".json")
    
    # Load existing data if available
    existing_data = []
    if os.path.exists(json_path):
        with open(json_path, "r") as json_file:
            existing_data = json.load(json_file)

    existing_data.append(data)

    with open(json_path, "w") as json_file:
        json.dump(existing_data, json_file, indent=4)
        


@app.route('/upload_csv_json', methods=['POST'])
def upload_csv_json():
    stored_json_data = []
    
    data = request.get_json()
    stored_json_data.extend(data)
    
    for object in stored_json_data:
        filename = object['class']
        save_data(object, filename)
        
    return jsonify({'message': 'JSON data uploaded successfully'})


# this route will get the ATTENDANCE  marked data from js and then store in json, cool right?
@app.route('/save_record', methods=['POST'])
def save_record():
    data = request.get_json()

    className = data.get("className")
    attendanceData = data.get("attendanceData")
    
    data_dir = os.path.join(app.root_path, "static", "data", "attendanceRecord")
    json_path = os.path.join(data_dir, f"{className}_attendance_record.json")


    existing_data = []

    if os.path.exists(json_path):
        with open(json_path, "r") as json_file:
            existing_data = json.load(json_file)

    date_to_save = attendanceData[0][0]

    

    for existing_record in existing_data:
        if existing_record[0][0] == date_to_save:
            existing_record[0][1:] = attendanceData[0][1:]
            break
    else:
        existing_data.append(attendanceData)

    with open(json_path, 'w') as json_file:
        json.dump(existing_data, json_file, indent=4)

    return jsonify({"message": "Attendance saved successfully"})  



@app.route("/submit_application", methods=["POST"])
def submit_application():
    applicant_data = {
        'name':'',
        'class':'',
        'applicationStatus': 'pending',
        'date_from': '',
        'date_to': '',
        'applicationName': ''
    }
    if 'applicationFile' not in request.files:
        return "No file part"
    
    student_name = request.form.get("studentName")
    student_Class = request.form.get("studentClass")
    
    date_from = request.form.get("date_from")
    date_to = request.form.get("date_to")

    file = request.files['applicationFile']
    file_name = file.filename

    if file.filename == '':
        return "No selected file"
    if file:
        upload_dir = os.path.join(app.root_path, "static", "data", "applications")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        file.save(file_path)
        
        
        applicant_data["name"] = student_name
        applicant_data["class"] = student_Class
        applicant_data["date_from"] = date_from
        applicant_data["date_to"] = date_to
        applicant_data["applicationName"] = file_name
        
        applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')
        
        existing_data = []
        if os.path.exists(applicantRecordDir):
            with open(applicantRecordDir, "r") as json_file:
                existing_data = json.load(json_file)
        existing_data.append(applicant_data)
        with open(applicantRecordDir, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)

            return "Application submitted successfully"

    return "Error submitting application"





@app.route("/applicantData", methods=["POST"])
def applicantData():
    data = request.get_json()
    className = data.get("className")
    applicants_data = []
    
    applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')
    
    existing_data = []
    if os.path.exists(applicantRecordDir):
        with open(applicantRecordDir, "r") as json_file:
            existing_data = json.load(json_file)
            
            for data in existing_data:
                if data["applicationStatus"] == "pending":
                    applicants_data.append(data)
        
            return jsonify(applicants_data)
        
        
@app.route("/approveApplication", methods=["POST"])
def approveApplication():
    data = request.get_json()
    className = data.get("className")
    studentName = data.get("studentName")

    applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')

    existing_data = []
    if os.path.exists(applicantRecordDir):
        with open(applicantRecordDir, "r") as json_file:
            existing_data = json.load(json_file)


            for record in existing_data:
                if record["class"] == className and record["name"] == studentName:
                    record["applicationStatus"] = "approved"
                    
                    notifyDir = os.path.join(app.root_path, "static", "data", 'notify.json')
                    exData = []
                    with open(notifyDir, "r") as notiData:
                            exData = json.load(notiData)
                            
                    exData.append(record["name"])
                    
                    with open(notifyDir, "w") as notiData:
                            json.dump(exData, notiData, indent=4)

        # Write the updated data back to the file
        with open(applicantRecordDir, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)
            

    return jsonify("ok")


@app.route("/cancelApplication", methods=["POST"])
def cancelApplication():
    data = request.get_json()
    className = data.get("className")
    studentName = data.get("studentName")

    applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')

    existing_data = []
    if os.path.exists(applicantRecordDir):
        with open(applicantRecordDir, "r") as json_file:
            existing_data = json.load(json_file)


            for record in existing_data:
                if record["class"] == className and record["name"] == studentName:
                    record["applicationStatus"] = "canceled"

        # Write the updated data back to the file
        with open(applicantRecordDir, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)

    return jsonify("ok")

@app.route("/applicantForAttendance", methods=["POST"])
def applicantForAttendance():
    data = request.get_json()
    className = data.get("className")
    date = data.get("date")
    applicantsApproved =[]
    
    applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')
    
    existing_data = []
    with open(applicantRecordDir, "r") as json_file:
            existing_data = json.load(json_file)
            
            for data in existing_data:
                if data["class"] == className and data["date_from"] <= date and date <= data["date_to"] and data["applicationStatus"] == "approved":
                    applicantsApproved.append(data)
                    
            print(applicantsApproved)
            return jsonify(applicantsApproved)
        
        
@app.route("/authAdmin", methods=["POST"])
def authAdmin():
    data = request.get_json()
    pin = data.get("adminPin")
    
    adminAuthDir = os.path.join(app.root_path, "static", "data", 'auth', 'adminAuth.json')
    
    existing_data = []
    
    with open(adminAuthDir, "r") as json_file:
            existing_data = json.load(json_file)
            if existing_data[0]["pinOrg"] == pin:
                return jsonify({"message": "authentication successfully"})
            
            
@app.route("/AdminKeyReset", methods=["POST"])
def AdminKeyReset():
    data = request.get_json()
    pin = data.get("adminPin")
    print(pin)
    
    adminAuthDir = os.path.join(app.root_path, "static", "data", 'auth', 'adminAuth.json')
    
    existing_data = []
    
    with open(adminAuthDir, "r") as json_file:
        existing_data = json.load(json_file)
        print(existing_data[0]["pinOrg"])
        
        # Convert pin to string before assignment
        existing_data[0]["pinOrg"] = str(pin)
        
        with open(adminAuthDir, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)
        
        return jsonify({"message": "key reset successful"})


@app.route("/AllApprovedApplications", methods=["POST"])
def AllApprovedApplications():
    applicantsApproved =[]
    
    applicantRecordDir = os.path.join(app.root_path, "static", "data", 'applicantRecord.json')
    
    existing_data = []
    with open(applicantRecordDir, "r") as json_file:
            existing_data = json.load(json_file)
            
            for data in existing_data:
                if data["applicationStatus"] == "approved":
                    applicantsApproved.append(data)
                    
            # print(applicantsApproved)
            return jsonify(applicantsApproved)     
        

@app.route("/logout", methods=["POST"])
def logout(): 
    # session.clear()
    return redirect(url_for("index"))



@app.route("/GetclassList", methods=["POST"])
def GetclassList():
    classDir =  os.path.join(app.root_path, "static", "data", 'classesRecord')
    classAvail = []
    
    if os.path.exists(classDir):
        for file_name in os.listdir(classDir):
            if file_name.endswith('.json'):
                classAvail.append(file_name)
    
    return jsonify(classAvail)

@app.route("/createAuthAccount", methods=["POST"])
def createAuthAccount():
    data = request.get_json()

    authData = {
        "name": data.get("name"),
        "username": data.get("username"),
        "password": data.get("password"),
        "class": data.get("CLASS"),
        "rollnumber": data.get("rollNumber"),
    }
    authType = data.get("authType")

    authDir = os.path.join(app.root_path, "static", "data", "auth")
    os.makedirs(authDir, exist_ok=True)
    authTypeFile = os.path.join(authDir, authType + ".json")

    # Check if there are existing accounts with the same username or password
    existing_data = []
    if os.path.exists(authTypeFile):
        with open(authTypeFile, "r") as json_file:
            existing_data = json.load(json_file)

            # Check for duplicate username
            if any(account["username"] == authData["username"] for account in existing_data):
                return jsonify({"message": "Username already exists. Choose a different username."})

            # Check for duplicate password
            if any(account["password"] == authData["password"] for account in existing_data):
                return jsonify({"message": "Password already exists. Choose a different password."})

    # If no duplicates found, proceed to create a new account
    if authData["name"] != "" and authData["class"] != "" and authData["username"] != "" and authData["password"] != "":
        existing_data.append(authData)

        with open(authTypeFile, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)

        return jsonify({"message": "New authentication account created"})
    else:
        return jsonify({"message": "Account creation unsuccessful"})

   
@app.route("/GetNotifyData", methods=["POST"])
def GetNotifyData():
    data = request.get_json()
    
    studentName = data.get("name")
   
    print(studentName)
    notifyDir = os.path.join(app.root_path, "static", "data", 'notify.json')
    exData = []
    with open(notifyDir, "r") as notiData:
            exData = json.load(notiData)
            
    for name in exData:
        if name == studentName:
            exData.remove(name)

            with open(notifyDir, "w") as notiData:
                json.dump(exData, notiData, indent=4)

            return jsonify({"message": "show notification"})


    return jsonify({"message": "dont show notification"})    
    
@app.route("/currentStudentAccounts", methods=["POST"])
def currentStudentAccounts():
    
    studentAuth_dir = os.path.join(app.root_path, "static", "data", "auth", "studentsignup.json")
    
    with open(studentAuth_dir, "r") as json_file:
        studentSignup_data = json.load(json_file)
    
    return jsonify(studentSignup_data)

@app.route("/currentTeachersAccounts", methods=["POST"])
def currentTeachersAccounts():
    
    facultyAuth_dir = os.path.join(app.root_path, "static", "data", "auth", "facultySignup.json")
    
    with open(facultyAuth_dir, "r") as json_file:
        facultySignup_data = json.load(json_file)
    
    return jsonify(facultySignup_data)
    
    

    
   
                  
if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
