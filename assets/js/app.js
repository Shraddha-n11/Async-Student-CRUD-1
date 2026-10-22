var cl = console.log;

const Base_url = "https://xhr-1st-crud-default-rtdb.firebaseio.com";
const Student_url = `${Base_url}/Students.json`;

const form = document.getElementById("form");
const spinner = document.getElementById("spinner");
const list = document.getElementById("list");
const Student = document.getElementById("Student");
const Course = document.getElementById("Course");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

// localstorage
let state = {
    StudentArr: [],
    Edit_Id: null,
};

// Snackbar
function Snakbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500,
    });
}

// spinner
function Handlespinner() {
    spinner.classList.toggle("d-none");
}

// templating
function Rendering(arr) {
    let result = ``;

    arr.forEach(ele => {
        result += `
        <li class="list-group-item d-flex justify-content-between align-items-center"
            id="${ele.id}">
            <div>
                <strong>${ele.student}</strong>
                <p class="mb-0 text-muted">${ele.course}</p>
            </div>

            <div>
                <i onclick="OnEditList(this)"
                    class="fa-solid fa-pen-to-square fa-2x text-primary mr-3"
                    role="button"></i>

                <i onclick="DeleteList(this)"
                    class="fa-solid fa-trash fa-2x text-danger"
                    role="button"></i>
            </div>
        </li>`;
    });

    list.innerHTML = result;
}

// read
async function Show() {
    Handlespinner();
    try {
        let res = await fetch(Student_url);
        let data = await res.json();
        state.StudentArr = [];
        for (const key in data) {
            data[key].id = key;
            state.StudentArr.unshift(data[key]);
        }

        Rendering(state.StudentArr);

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

Show();

// create
async function CreateData(eve) {
    eve.preventDefault();
    Handlespinner();
    try {
        let obj = {
            student: Student.value,
            course: Course.value
        };

        let res = await fetch(Student_url, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        let data = await res.json();

        obj.id = data.name;

        state.StudentArr.unshift(obj);

        Rendering(state.StudentArr);

        Snakbar("New Student Created", "success");
        form.reset();

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

// edit
function OnEditList(eve) {
    let Edit_id = eve.closest("li").id;

    state.Edit_Id = Edit_id;

    let Edit_obj = state.StudentArr.find(
        t => t.id === Edit_id
    );

    Student.value = Edit_obj.student;
    Course.value = Edit_obj.course;

    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
}

// update
async function UpdateList() {
    Handlespinner();

    let Update_id = state.Edit_Id;

    try {
        let update_obj = {
            student: Student.value,
            course: Course.value,
            id: Update_id
        };

        let Update_url =
            `${Base_url}/Students/${Update_id}.json`;

        let res = await fetch(Update_url, {
            method: "PATCH",
            body: JSON.stringify(update_obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        let data = await res.json();

        let index = state.StudentArr.findIndex(
            t => t.id === Update_id
        );

        state.StudentArr[index] = update_obj;

        let li = document.getElementById(Update_id);

        li.querySelector("strong").innerText = data.student;
        li.querySelector("p").innerText = data.course;

        submitBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");

        state.Edit_Id = null;

        Snakbar("Student Updated", "success");
        form.reset();

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

// Delete
async function DeleteList(eve) {
    let Remove_id = eve.closest("li").id;

    let result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
        Handlespinner();

        try {
            let Remove_url =
                `${Base_url}/Students/${Remove_id}.json`;

            let res = await fetch(Remove_url, {
                method: "DELETE"
            });

            let index = state.StudentArr.findIndex(
                t => t.id === Remove_id
            );

            state.StudentArr.splice(index, 1);

            eve.closest("li").remove();

            Snakbar("Student Removed!", "success");

        } catch (err) {
            cl(err);
        } finally {
            Handlespinner();
        }
    }
}

// events
form.addEventListener("submit", CreateData);
updateBtn.addEventListener("click", UpdateList);
