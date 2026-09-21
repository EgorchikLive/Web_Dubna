//SHOW MENU
document.querySelector('.burger')
    .addEventListener('click', ()=>{
        document.querySelector('.header nav ul').classList.toggle('show_menu') 
    })

//POPUP

let popup = document.querySelector('.popup_overlay');

document.querySelector('.enter_block')
    .addEventListener('click', ()=>{
        popup.classList.remove('popup_hidden');
        document.getElementById('form-login').focus();
    })

document.querySelector('.popup_close')
    .addEventListener('click', ()=>{
        popup.classList.add('popup_hidden');
    })


window.onclick = function(e){
    if(e.target == popup){
        popup.classList.add('popup_hidden');
    }
}

document.querySelector('.show_password')
    .addEventListener('mousedown', ()=>{
        document.querySelector('#form-password').setAttribute('type', 'text')
    })

document.querySelector('.show_password')
    .addEventListener('mouseup', ()=>{
        document.querySelector('#form-password').setAttribute('type', 'password')
    })

document.querySelector('.popup_wrapper form')
    .addEventListener('submit',(e)=>{
        e.preventDefault();
        localStorage.setItem('login', document.getElementById('form-login').value);
        localStorage.setItem('password', document.getElementById('form-password').value);
        document.querySelector('.popup_wrapper').classList.add('popup_hidden')
        document.querySelector('.thx_wrapper').classList.remove('popup_hidden')
    })

document.querySelector('.select_arrow')
    .addEventListener('click', ()=>{
        document.querySelector('.calc_block_left ul')
            .classList.toggle('list_hidden')
    })