import Noty from 'noty'
import { initAdmin } from './admin'
import { initAdmin1 } from './admin_user'
import { initAdmin2 } from './admin_product'
import moment from 'moment'


 const alertMsg = document.querySelector('#success-alert')
 if(alertMsg){
     setTimeout(() => {
         alertMsg.remove()
     }, 2000)
 }


// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}


updateStatus(order);

let socket = io()
initAdmin(socket)




//join
if(order) {
    socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    console.log(data);
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})


const body = document.querySelector("body"),
sidebar = body.querySelector("nav"),
toggle = body.querySelector(".toggle"),
searchBtn = body.querySelector(".search-oyo")
toggle.addEventListener("click", () => {
sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
sidebar.classList.add("close");
});
