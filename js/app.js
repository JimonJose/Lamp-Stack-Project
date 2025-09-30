const urlBase = 'https://pcm-pro.net/api';
const extension = 'php';
let userId = 0;
let CONTACTS = [
];


// Element refs (with guards) ----------------------------------------------------------------------------------------------------
const rows        = document.getElementById('rows');
const search      = document.getElementById('search');
const dialog      = document.getElementById('contactDialog');
const form        = document.getElementById('contactForm');
const cId         = document.getElementById('cId');
const cName       = document.getElementById('cName');
const cEmail      = document.getElementById('cEmail');
const cPhone      = document.getElementById('cPhone');
const dialogTitle = document.getElementById('dialogTitle');
const notice      = document.getElementById('notice');
const addBtn      = document.getElementById('addBtn');
const cancelBtn   = document.getElementById('cancelBtn');
const saveBtn   = document.getElementById('saveBtn');
const logoutBtn   = document.getElementById('logoutBtn');
const spinner   = document.getElementById('spinner');


function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// CRUD Operations ----------------------------------------------------------------------------------------------------
function getCurrentUser() {
	
  let url = urlBase + '/get_current_user.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
    let status = jsonObject.status;
    const user = jsonObject.user;
		
    if( status === "error" ) {	
      window.location.href = "index.html";
      }
    const username = document.getElementById('username');
    username.textContent = user.Username;
    }
    };
    xhr.send();
 	  }
    catch(err)
    {
      window.location.href = "index.html";
    }

}

function getContacts() {
  spinner.hidden = false;
  
  let url = urlBase + '/contacts/read.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
		
    CONTACTS = [...jsonObject];
    spinner.hidden = true;
    renderFiltered();
    }
    };
    xhr.send();
 	  }
    catch(_)
    {
      /* ignore */
      spinner.hidden = true;
    }
}

function addContact(name, email, phone) {
  spinner.hidden = false;
  
  let tmp = { firstName: name, email: email, phone: phone };
  let jsonPayload = JSON.stringify( tmp );
	let url = urlBase + '/contacts/create.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
		const status = jsonObject.status;
    const contactId = jsonObject.contactId;
    
    if (status === "success") {
      const data = {"ContactID": contactId,"FirstName": name,"LastName":"","Email": email,"PhoneNumber": phone};
      CONTACTS.push(data);
      spinner.hidden = true;
      renderFiltered();
      renderNotice('Contact saved.');
    }
    else {
      const message = jsonObject.message;
      renderNotice(message);
      spinner.hidden = true;
    }
    }
    };
    xhr.send(jsonPayload);
 	  }
    catch(_)
    {
      /* ignore */
    }

}

function editContact(contactId, name, email, phone) {
  spinner.hidden = false;

  let tmp = { contactId: contactId, firstName: name, email: email, phone: phone };
  let jsonPayload = JSON.stringify( tmp );
	let url = urlBase + '/contacts/update.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
		const status = jsonObject.status;
    
    if (status === "success") {
      const data = {"ContactID": contactId,"FirstName": name,"LastName":"","Email": email,"PhoneNumber": phone};
      CONTACTS = CONTACTS.map(x => x.ContactID === data.ContactID ? data : x);
      spinner.hidden = true;
      renderFiltered();
      renderNotice('Contact edited.');
    }
    else {
      const message = jsonObject.message;
      renderNotice(message);
      spinner.hidden = true;
    }
    }
    };
    xhr.send(jsonPayload);
 	  }
    catch(_)
    {
      /* ignore */
    }

}

function deleteContact(contactId) {
  spinner.hidden = false;

	let url = urlBase + '/contacts/delete.' + extension + '?contactId=' + contactId;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
		const status = jsonObject.status;
    
    if (status === "success") {
      CONTACTS = CONTACTS.filter(x => x.ContactID !== contactId);
      spinner.hidden = true;
      renderFiltered();
      renderNotice('Contact deleted.');
    }
    else {
      const message = jsonObject.message;
      renderNotice(message);
      spinner.hidden = true;
    }
    }
    };
    xhr.send();
 	  }
    catch(_)
    {
      /* ignore */
    }

}

// Rendering ----------------------------------------------------------------------------------------------------
function render(list) {
  rows.innerHTML = '';
  if (!list.length) {
    if (notice) {
      notice.hidden = false;
      notice.textContent = (search && search.value.trim())
        ? 'No contacts found.'
        : 'No contacts yet. Add your first one!';
    }
    return;
  }
  if (notice) notice.hidden = true;

  for (const c of list) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.FirstName)}</td>
      <td>${escapeHtml(c.Email)}</td>
      <td>${escapeHtml(c.PhoneNumber)}</td>
      <td>
        <button class="btn small outline" data-edit="${c.ContactID}">Edit</button>
        <button class="btn small" data-del="${c.ContactID}">Delete</button>
      </td>`;
    rows.appendChild(tr);
  }
}

function renderFiltered(){
  const q = (search?.value || '').trim().toLowerCase();
  const filtered = CONTACTS.filter(c =>
    c.FirstName.toLowerCase().includes(q) ||
    c.Email.toLowerCase().includes(q) ||
    c.PhoneNumber.toLowerCase().includes(q)
  );
  render(filtered);
}

function renderNotice(text) {
  // Show a subtle success message
  if (notice) {
      notice.hidden = false;
      notice.textContent = text;
      setTimeout(() => { if (notice) notice.hidden = true; }, 5000);
  }
}


// Search (debounced) ----------------------------------------------------------------------------------------------------
if (search) {
  let t;
  search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(renderFiltered, 250);
  });
}


// Add contact (open dialog) ----------------------------------------------------------------------------------------------------
if (addBtn) {
  addBtn.addEventListener('click', () => {
    dialogTitle.textContent = 'Add contact';
    cId.value = '';
    form.reset();
    dialog.showModal();
    // Focus first field after dialog opens
    setTimeout(() => cName?.focus(), 0);
  });
}


// Cancel closes dialog ----------------------------------------------------------------------------------------------------
cancelBtn?.addEventListener('click', () => {
  dialog.close();
});

// Reset form when dialog closes (Esc or Cancel)
dialog?.addEventListener('close', () => form.reset());
dialog?.addEventListener('cancel', () => form.reset());


// Row actions: Edit / Delete ----------------------------------------------------------------------------------------------------
rows.addEventListener('click', (e) => {
  const editId = e.target.dataset?.edit;
  const delId  = e.target.dataset?.del;

  if (editId) {
    const c = CONTACTS.find(x => x.ContactID === Number(editId));
    if (!c) return;
    dialogTitle.textContent = 'Edit contact';
    cId.value = c.ContactID;
    cName.value = c.FirstName; cEmail.value = c.Email; cPhone.value = c.PhoneNumber;
    dialog.showModal();
    setTimeout(() => cName?.focus(), 0);
  } else if (delId) {
    if (!confirm('Delete this contact?')) return;
    deleteContact(Number(delId));
  }
});


// Save (Add or Edit) ----------------------------------------------------------------------------------------------------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    id: cId.value ? Number(cId.value) : Date.now(),
    name: (cName.value || '').trim(),
    email: (cEmail.value || '').trim(),
    phone: (cPhone.value || '').trim()
  };

  // Basic validation
  if (!data.name || !data.email || !data.phone) {
    if (notice) {
      notice.hidden = false;
      notice.textContent = 'Please fill out name, email, and phone.';
    }
    return;
  }

  if (cId.value) {
    editContact(data.id, data.name, data.email, data.phone);
  } else {
    addContact(data.name, data.email, data.phone);
  }

  dialog.close();
});


// Logout ----------------------------------------------------------------------------------------------------
logoutBtn?.addEventListener('click', () => {
	
  let url = urlBase + '/logout.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
  xhr.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200)  {
    let jsonObject = JSON.parse( xhr.responseText );
    let status = jsonObject.status;
		
    if( status === "success" ) {	
      window.location.href = "index.html";
      }
    }
    };
    xhr.send();
 	  }
    catch(_)
    {
      /* ignore */
    }
});


// Initial draw ----------------------------------------------------------------------------------------------------
getCurrentUser();
getContacts();
render(CONTACTS);
