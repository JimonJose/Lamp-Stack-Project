
// Demo data + persistence ----------------------------------------------------------------------------------------------------
let CONTACTS = [
  { id: 1, name: "Alice Johnson", email: "alice@demo.com", phone: "123-4567" },
  { id: 2, name: "Alan Smith",   email: "alan@demo.com",  phone: "555-9876" },
  { id: 3, name: "Mia Lee",      email: "mia@demo.com",   phone: "404-1122" },
];

// Load saved contacts if present (for demo) ----------------------------------------------------------------------------------------------------
try {
  const saved = JSON.parse(localStorage.getItem('contacts'));
  if (Array.isArray(saved) && saved.length) CONTACTS = saved;
} catch (_) { /* ignore */ }


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
const logoutBtn   = document.getElementById('logoutBtn');


// Utilities
function saveContacts() {
  try { localStorage.setItem('contacts', JSON.stringify(CONTACTS)); } catch (_) {}
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>
        <button class="btn small outline" data-edit="${c.id}">Edit</button>
        <button class="btn small" data-del="${c.id}">Delete</button>
      </td>`;
    rows.appendChild(tr);
  }
}

function renderFiltered(){
  const q = (search?.value || '').trim().toLowerCase();
  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.phone.toLowerCase().includes(q)
  );
  render(filtered);
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
    const c = CONTACTS.find(x => x.id === Number(editId));
    if (!c) return;
    dialogTitle.textContent = 'Edit contact';
    cId.value = c.id;
    cName.value = c.name; cEmail.value = c.email; cPhone.value = c.phone;
    dialog.showModal();
    setTimeout(() => cName?.focus(), 0);
  } else if (delId) {
    if (!confirm('Delete this contact?')) return;
    CONTACTS = CONTACTS.filter(x => x.id !== Number(delId));
    saveContacts();
    renderFiltered();
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
    CONTACTS = CONTACTS.map(x => x.id === data.id ? data : x);
  } else {
    CONTACTS.push(data);
  }

  saveContacts();
  dialog.close();

  // Show a subtle success notice
  if (notice) {
    notice.hidden = false;
    notice.textContent = 'Contact saved.';
    setTimeout(() => { if (notice) notice.hidden = true; }, 1200);
  }

  renderFiltered();

  // TODO (when backend is ready): replace with real AJAX calls:
  // await api('/contacts', data, method);
});


// Logout (demo) ----------------------------------------------------------------------------------------------------
logoutBtn?.addEventListener('click', () => {
  // Clear demo username if you're storing it
  localStorage.removeItem('username');
  location.href = 'index.html';
});


// Initial draw ----------------------------------------------------------------------------------------------------
render(CONTACTS);
