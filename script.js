let tbody= document.getElementById("studenttablebody");
let button1 = document.getElementById("secondbutton");
let button = document.getElementById("addStudentButton");
let form = document.getElementById("studentform");
let studentCount= document.getElementById("studentCount");
let averageGrade= document.getElementById("averageGrade");
let searchInput = document.getElementById("searchStudent");
function updateStudentCount() {
    let numberOfStudents=tbody.querySelectorAll("tr").length;
    studentCount.textContent= numberOfStudents;
}
updateStudentCount();
function updateAverageGrade(){
    let rows =tbody.querySelectorAll("tr");
    let total=0;
    for (let row of rows){
        let cells=row.querySelectorAll("td");
        let grade= Number(cells[2].textContent);
        total=(total+grade);
    }
    let numberOfStudents=tbody.querySelectorAll("tr").length;
    if (numberOfStudents === 0) {
    averageGrade.textContent = "0";
    return;
    }
    else {
    total=total/numberOfStudents;
    averageGrade.textContent = total.toFixed(2);
}}
updateAverageGrade();
function createGradeBadge(grade) {
    let gradeBadge = document.createElement("span");

    gradeBadge.textContent = grade;
    gradeBadge.classList.add("grade-badge");

    if (grade >= 18) {
        gradeBadge.classList.add("grade-excellent");
    }
    else if (grade >= 14) {
        gradeBadge.classList.add("grade-good");
    }
    else if (grade >= 10) {
        gradeBadge.classList.add("grade-average");
    }
    else {
        gradeBadge.classList.add("grade-poor");
    }

    return gradeBadge;
}
function addActionsToRow(row){
    let editButton=document.createElement("button");
    editButton.classList.add("edit-btn");
    editButton.textContent="edit";
    let deleteButton=document.createElement("button");
    deleteButton.textContent="delete";
    deleteButton.classList.add("delete-btn");
    let tdx=document.createElement("td");
    row.appendChild(tdx);
    let tdy=document.createElement("td");
    row.appendChild(tdy);
    tdx.appendChild(editButton);
    tdy.appendChild(deleteButton);
    editButton.addEventListener("click",function(){
      editButton.style.display = "none";
      let cells = row.querySelectorAll("td");
      let originalName = cells[0].textContent;
      let originalAge = cells[1].textContent;
      let originalGrade= cells[2].textContent;
      let cancelButton= document.createElement("button");
      cancelButton.textContent="cancel";
      tdx.appendChild(cancelButton);
      let nameEdit = document.createElement("input");
      let ageEdit = document.createElement("input");
      ageEdit.type="number";
      let gradeEdit = document.createElement("input");
      gradeEdit.type="number";
      let saveButton=document.createElement("button");
      saveButton.textContent="save";
      tdx.appendChild(saveButton);
      nameEdit.value=cells[0].textContent;
      ageEdit.value=cells[1].textContent;
      gradeEdit.value=cells[2].textContent;
      cells[0].textContent="";
      cells[1].textContent="";
      cells[2].textContent="";
      cells[0].appendChild(nameEdit);
      cells[1].appendChild(ageEdit);
      cells[2].appendChild(gradeEdit);
      cancelButton.addEventListener("click",function(){
        cells[0].textContent = originalName;
        cells[1].textContent = originalAge;
        cells[2].replaceChildren(createGradeBadge(Number(originalGrade)));;
        cancelButton.remove();
        saveButton.remove();
        editButton.style.display="";
      })
      saveButton.addEventListener("click", async function(){ 
        try{
            if (nameEdit.value.trim() === ""){
               alert("invalid name");
               return;   
            }
            if (ageEdit.value==="" ){
               alert("age required");
               return; 
            }
            if (gradeEdit.value==="" ){
               alert("grade required");
               return; 
            }
            if (Number.isNaN(Number(gradeEdit.value))){
                alert("invalid grade");
                return; 
            }
            if (Number.isNaN(Number(ageEdit.value))){
                alert("invalid age");
                return; 
            }
            if (ageEdit.value<0 ){
                alert("invalid age");
                return; 
            }
            if (!Number.isInteger(Number(ageEdit.value)) ){
                alert("invalid age");
                return; 
            }
            if (gradeEdit.value < 0 || gradeEdit.value > 20){
                alert("invalid grade");
                return;
            }
            saveButton.disabled=true;
            let response = await fetch(`http://127.0.0.1:8000/students/${row.dataset.id}`,
           {
              method:"PUT",
              headers:{
                "Content-Type":"application/json"
              },
              body:JSON.stringify({
                name:nameEdit.value.trim(),
                age: Number(ageEdit.value),
                grade: Number(gradeEdit.value),
              })
            })
            if (response.ok){
               cells[0].textContent=nameEdit.value.trim();
               cells[1].textContent=ageEdit.value;
               cells[2].replaceChildren(createGradeBadge(Number(gradeEdit.value)));
               updateAverageGrade();
               editButton.style.display = "";
               saveButton.remove();
               cancelButton.remove();
            }
            else{
                let errorData = await response.json();
                alert(`Failed to update student.error code ${response.status}.${errorData.detail}`); 
            }
        }
        catch(error){
            console.error("EDIT/SAVE ERROR:", error);
            alert(`Error: ${error.message}`);
        }finally{
            saveButton.disabled=false;
        }
        })
    })
    deleteButton.addEventListener("click", async function(){
        try{
           let response=await fetch(`http://127.0.0.1:8000/students/${row.dataset.id}`,{
           method:"DELETE",
           })
            if (response.ok){
               row.remove();
               updateStudentCount();
               updateAverageGrade();
            } 
            else{
               alert("an error has occured delete failed");
            }
        }
        catch(error){
            console.error("connection error:",error );
            alert("An unexpected error occurred. Please try again.");
        }   
        }) 
}
async function loadStudents() {
    try {
        
        let response=await fetch("http://127.0.0.1:8000/students");
        if (response.ok){    
            let students = await response.json();    
            for (let student of students){
            let row=document.createElement("tr");
            row.dataset.id = student.id;
            let nameCell = document.createElement("td");
            let ageCell = document.createElement("td");
            let gradeCell = document.createElement("td");
            let gradeBadge = createGradeBadge(student.grade);
            ageCell.textContent=student.age;
            gradeCell.appendChild(gradeBadge);
            nameCell.textContent=student.name;
            row.appendChild(nameCell);
            row.appendChild(ageCell);
            row.appendChild(gradeCell);
            tbody.appendChild(row);
            addActionsToRow(row);
            }
        }
    
        else{
            alert("server  error");

    }
}
catch (networkerror) {
            alert("connection error");
    }
    updateStudentCount();
    updateAverageGrade();
}
loadStudents();
button.addEventListener("click", function(){
    form.style.display = "block";
});
button1.addEventListener("click", async  function(event){
    event.preventDefault();
    let nameinput = document.getElementById("studentname");
    let ageinput = document.getElementById("studentage");
    let gradeinput = document.getElementById("studentgrade");
    let name=nameinput.value;
    let age=ageinput.value;
    let grade=gradeinput.value;
    if( name===""){
        alert("invalid name");
        return;
    }
    if(age<0){
        alert("invalid  age ");
        return;
    }
    if (age ==="" ){
        alert("age required");
        return; 
        }
    if (grade ==="" ){
        alert("grade required");
        return;
    }
    if(grade<0||grade>20){
        alert("invalid  grade ");
        return;
    }
    try{
        let response= await fetch("http://127.0.0.1:8000/students",{
            method:"Post",
            headers:{
            "Content-Type":"application/json" 
        },
        body: JSON.stringify({
        name: name,
        age: Number(age),
        grade: Number(grade),

       })
    }) 
       if (response.ok){
           let newStudent =await response.json();
           console.log(newStudent);   
           let tablerow=document.createElement("tr");
           tablerow.dataset.id = newStudent.id;
           let td1=document.createElement("td");
           let td2=document.createElement("td");
           let td3=document.createElement("td");
           td1.textContent=newStudent.name;
           td2.textContent=newStudent.age;
           td3.appendChild(createGradeBadge(newStudent.grade));
           tablerow.appendChild(td1);
           tablerow.appendChild(td2);
           tablerow.appendChild(td3);
           tbody.appendChild(tablerow);
           addActionsToRow(tablerow);    
           updateStudentCount();
           updateAverageGrade();
           form.style.display="none";
           nameinput.value="";
           ageinput.value="";
           gradeinput.value="";
        }
        else{
            try{ 
                let errorData = await response.json();
                console.log(errorData);    
                if(response.status === 422){
                    alert(errorData.detail?.[0]?.msg || "an unexpected error occured");
                }
                else{
                    alert(errorData.message || `error code ${response.status}`);
                }
        
            }
            catch(error){
                console.error("json-parsing error",error);
                alert("a json-parsin error occured");
            } 
        }    
    
    }
    catch(error){
        console.error("request failed:",error);
        alert("an unexpected error occured. Please try again.");
    }
})

searchInput.addEventListener("input", function() {
let searchText=searchInput.value;
console.log(searchText);
let rows = tbody.querySelectorAll("tr");
for (let row of rows) {
    let cells = row.querySelectorAll("td");
    let studentName = cells[0].textContent;
    if (studentName.toLowerCase().includes(searchText.toLowerCase())){
        row.style.display="";
    }else{
         row.style.display="none";
    }
}
});




    