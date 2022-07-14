import axios from 'axios'
import moment from 'moment'
import Noty from 'noty'

// export function initAdmin(socket) {
export function initAdmin1(socket) {
    const userTableBody = document.querySelector('#userTableBody')
    let users = []
    let markups

    axios.get('/admin/users', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        users = res.data
        markups = generateMarkup(users)
        userTableBody.innerHTML = markups
    }).catch(err => {
        console.log(err)
    })



    function renderItems(items) {
        let parsedItems = Object.values(items)
        return parsedItems.map((menuItem) => {
            return `
                <p>${menuItem.item.name} - ${menuItem.qty} pcs </p>
            `
        }).join('')
    }

    function generateMarkup(users) {
        return users.map(user => {
            return `
                <tr>         
                <td class="border px-4 py-2">Name-${user.lname} <br> Phone-${user.phone}</td>
                <td class="border px-4 py-2">${user.address}</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/user/status" method="POST">
                            <input type="hidden" name="userId" value="${user._id}">
                            <select name="isverified" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="No"
                                    ${user.isverified === 'No' ? 'selected' : ''}>
                                    No</option>
                                <option value="Yes" ${user.isverified === 'Yes' ? 'selected' : ''}>
                                    Yes</option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>

                 <td class="border px-4 py-2">
                     ${moment(user.createdAt).format('hh:mm A')}
                </td>

                <td class="border px-4 py-2">
                <a class="link" href="/view/doc/${user.fname}/${user.institutionName}">
                    <div target="_blank" class="inline-block cursor-pointer btn-primary px-2 py-1 rounded-full text-white" >View Uploaded Documents</div></a>
               </td>
               
            </tr>
        `
        }).join('')
    }

    socket.on('userCreated', (user) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'New user!',
            progressBar: false,
        }).show();
        users.unshift(user)
        userTableBody.innerHTML = ''
        userTableBody.innerHTML = generateMarkup(users)
    })

}
