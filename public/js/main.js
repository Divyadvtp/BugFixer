$(document).ready(function(){
    tinymce.init({
        selector: '#description'
    });
});

function process(){
    var description = document.getElementById('description').value;
    // var output = document.getElementById('output');
    // output.innerHTML += message;
    return false;
}