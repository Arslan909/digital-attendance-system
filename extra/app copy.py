from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import json
# import csv

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("entrance.html")



@app.route("/authenticate", methods=["POST"])
def authenticate():
    data = request.get_json()
    class_name = data.get("class")
    uName = data.get("username")
    pwd = data.get("password")
    print(uName)
    print(pwd)
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
                    return redirect(url_for("attendanceExtra", class_name=class_name))
        with open(studentAuth_dir, "r") as json_file:
            studentSignup_data = json.load(json_file)
            for usersInfo in studentSignup_data:
                if usersInfo["username"] == uName and usersInfo["password"] == pwd:
                    return redirect(url_for("profile", student_name=usersInfo["name"], class_name=class_name))

    return "Authentication failed"


@app.route("/attendanceExtra", methods=["GET"])
def attendanceExtra():
    class_name = request.args.get('class_name')
    class_name = class_name.lower()

    class_data_dir = os.path.join(app.root_path, "static", "data", "classesRecord")
    class_json_path = os.path.join(class_data_dir, f"{class_name}.json")

    if os.path.exists(class_json_path):
        return render_template("attendance1.html", class_name=class_name)
    else:
        return "Class not found"


@app.route("/profile")
def profile():
    class_name = request.args.get('class_name')
    student_name = request.args.get('student_name')
    return render_template("profile.html", class_name=class_name, student_name=student_name)



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
    class_name = request.args.get("class_name")
    return render_template("report.html", class_name=class_name)


@app.route("/percentage_report_page", methods=["GET"])
def percentage_report_page():
    class_name = request.args.get("class_name")
    return render_template("percentage_report.html", class_name=class_name)



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
    return render_template("form1.html", class_name=class_name)



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
        filename = object['Class']
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



if __name__ == "__main__":
    app.run(debug=True)
