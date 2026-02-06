const STORAGE_KEYS = {
  providers: "fs_providers",
  users: "fs_users",
  currentUser: "fs_current_user",
  bookings: "fs_bookings"
};

const DEFAULT_PROVIDERS_URL = "./data/providers.json";
const EMAIL_PUBLIC_KEY = "hlvcOU5WEDXlQqcQo";

const fallbackProviders = [
  {
    id: "barber-sami-elwakeel",
    type: "barber",
    displayName: "الحلاق سامى الوكيل",
    rating: 3,
    location: "صالون جلاكسى - شارع المول",
    image: "/imgs/braber_five.jpg",
    providerKey: "Sami ElWakeel",
    schedule: [
      { day: "الإثنين", times: ["10:00 صباحًا", "3:00 مساء"] },
      { day: "الخميس", times: ["12:00 مساء", "5:00 مساء"] }
    ]
  },
  {
    id: "clinic-ebtisam-mahmoud",
    type: "clinic",
    displayName: "د. ابتسام محمود",
    rating: 4,
    location: "عيادة الفتح - شارع الاهرام",
    image: "/imgs/doctor_two.jpg",
    providerKey: "Ebtisam Mahmoud",
    schedule: [
      { day: "الأحد", times: ["9:00 صباحًا", "1:00 مساء"] },
      { day: "الثلاثاء", times: ["2:00 مساء", "4:00 مساء"] }
    ]
  },
  {
    id: "barber-shaaban",
    type: "barber",
    displayName: "الحلاق شعبان",
    rating: 4,
    location: "صالون نعنشه - شارع الفتح",
    image: "/imgs/braber_three.jpg",
    providerKey: "Shaaban",
    schedule: [
      { day: "الجمعة", times: ["4:00 مساء", "6:00 مساء"] },
      { day: "السبت", times: ["11:00 صباحًا", "1:00 مساء"] }
    ]
  },
  {
    id: "clinic-mai-ibrahim",
    type: "clinic",
    displayName: "د. مى إبراهيم",
    rating: 5,
    location: "عيادة الفؤاد - شارع المخابرات",
    image: "/imgs/doctor_three.jpg",
    providerKey: "Mai Ibrahim",
    schedule: [
      { day: "الأربعاء", times: ["8:30 صباحًا", "12:00 مساء"] },
      { day: "الخميس", times: ["3:00 مساء", "6:00 مساء"] }
    ]
  },
  {
    id: "barber-sami",
    type: "barber",
    displayName: "الحلاق سامي",
    rating: 3,
    location: "صالون جلامر - شارع المراغي",
    image: "/imgs/braber_two.jpg",
    providerKey: "Sami",
    schedule: [
      { day: "الجمعه", times: ["5:00 صباحا", "8:00 مساء"] },
      { day: "الأربعاء", times: ["4:00 مساء", "8:00 مساء"] }
    ]
  },
  {
    id: "gym-ameen-khalil",
    type: "gym",
    displayName: "كابتن أمين خليل",
    rating: 5,
    location: "جيم فتنس باور - شارع الخزان التجمع",
    image: "/imgs/gym_two.jpg",
    providerKey: "Ameen Khalil",
    schedule: [
      { day: "الإثنين", times: ["5:00 مساء", "7:00 مساء"] },
      { day: "الأربعاء", times: ["6:00 مساء", "8:00 مساء"] }
    ]
  },
  {
    id: "clinic-gamilah-tharwat",
    type: "clinic",
    displayName: "د. جميلة ثروت",
    rating: 4,
    location: "عيادة الجابرى - شارع المركزى",
    image: "/imgs/doctor_five.jpg",
    providerKey: "Gamilah Tharwat",
    schedule: [
      { day: "السبت", times: ["9:00 صباحًا", "2:00 مساء"] },
      { day: "الإثنين", times: ["1:00 مساء", "4:00 مساء"] }
    ]
  },
  {
    id: "barber-magid-eltabie",
    type: "barber",
    displayName: "الحلاق ماجد التابعى",
    rating: 5,
    location: "صالون جلاكسى - شارع المول",
    image: "/imgs/braber_three.jpg",
    providerKey: "Magid ElTabie",
    schedule: [
      { day: "الأحد", times: ["1:00 مساء", "3:00 مساء"] },
      { day: "الثلاثاء", times: ["10:00 صباحًا", "12:00 مساء"] }
    ]
  },
  {
    id: "gym-sameh-abdo",
    type: "gym",
    displayName: "كابتن سامح عبده",
    rating: 5,
    location: "جيم فتنس داى - شارع العبور التجمع",
    image: "/imgs/gym_one.jpg",
    providerKey: "Sameh Abdo",
    schedule: [
      { day: "الثلاثاء", times: ["6:00 مساء", "9:00 مساء"] },
      { day: "الخميس", times: ["7:00 مساء", "10:00 مساء"] }
    ]
  },
  {
    id: "clinic-ameen-mamdouh",
    type: "clinic",
    displayName: "د. أمين ممدوح",
    rating: 3,
    location: "عيادة الأمل - شارع التحرير",
    image: "/imgs/doctor_four.jpg",
    providerKey: "Ameen Mamdouh",
    schedule: [
      { day: "الأربعاء", times: ["10:00 صباحًا", "12:30 مساء"] },
      { day: "الجمعة", times: ["4:00 مساء", "6:00 مساء"] }
    ]
  },
  {
    id: "gym-saleh-mohamed",
    type: "gym",
    displayName: "كابتن صالح محمد",
    rating: 5,
    location: "جيم القوة الناعمة - شارع محمد عبده",
    image: "/imgs/gym_three.jpg",
    providerKey: "Saleh Mohamed",
    schedule: [
      { day: "السبت", times: ["5:00 مساء", "7:00 مساء"] },
      { day: "الإثنين", times: ["3:00 مساء", "5:00 مساء"] }
    ]
  },
  {
    id: "barber-mohsen-sharif",
    type: "barber",
    displayName: "الحلاق محسن شريف",
    rating: 4,
    location: "صالون لمعه - شارع جمال عبدالناصر",
    image: "/imgs/braber_four.jpg",
    providerKey: "Mohsen Sharif",
    schedule: [
      { day: "الأحد", times: ["11:00 صباحًا", "2:00 مساء"] },
      { day: "الخميس", times: ["1:00 مساء", "4:00 مساء"] }
    ]
  },
  {
    id: "gym-lotfy-khaled",
    type: "gym",
    displayName: "كابتن لطفى خالد",
    rating: 3,
    location: "جيم لايف باور - شارع اللؤلؤه",
    image: "/imgs/gym_three.jpg",
    providerKey: "Lotfy Khaled",
    schedule: [
      { day: "الثلاثاء", times: ["4:00 مساء", "6:00 مساء"] },
      { day: "الجمعة", times: ["7:00 مساء", "9:00 مساء"] }
    ]
  },
  {
    id: "clinic-manal-elsoghary",
    type: "clinic",
    displayName: "د. منال الصغيرى",
    rating: 4,
    location: "عيادة الفؤاد - شارع التوحيد",
    image: "/imgs/doctor_two.jpg",
    providerKey: "Manal ElSoghary",
    schedule: [
      { day: "الإثنين", times: ["9:00 صباحًا", "11:00 صباحًا"] },
      { day: "الأربعاء", times: ["12:00 مساء", "2:00 مساء"] }
    ]
  },
  {
    id: "barber-mohamed-elhelw",
    type: "barber",
    displayName: "الحلاق محمد الحلو",
    rating: 3,
    location: "صالون فبريكا - شارع الكنانة",
    image: "/imgs/braber.jpg",
    providerKey: "Mohamed ElHelw",
    schedule: [
      { day: "السبت", times: ["2:00 مساء", "4:00 مساء"] },
      { day: "الثلاثاء", times: ["10:00 صباحًا", "12:00 مساء"] }
    ]
  },
  {
    id: "gym-ramy-hassanein",
    type: "gym",
    displayName: "كابتن رامي حسانين",
    rating: 5,
    location: "جيم فتنس جلاكسي - شارع مكرم عبيد",
    image: "/imgs/gym_four.jpg",
    providerKey: "Ramy Hassanein",
    schedule: [
      { day: "الخميس", times: ["6:00 مساء", "8:00 مساء"] },
      { day: "الجمعة", times: ["5:00 مساء", "7:00 مساء"] }
    ]
  },
  {
    id: "clinic-ziad-elsaeed",
    type: "clinic",
    displayName: "د. زياد السعيد",
    rating: 4,
    location: "عيادة زياد التخصوصية - شارع البستان",
    image: "/imgs/doctor_one.jpg",
    providerKey: "Ziad ElSaeed",
    schedule: [
      { day: "الأحد", times: ["10:00 صباحًا", "12:00 مساء"] },
      { day: "الثلاثاء", times: ["1:00 مساء", "3:00 مساء"] }
    ]
  },
  {
    id: "gym-ramy-elderaa",
    type: "gym",
    displayName: "كابتن رامي الدرع",
    rating: 4,
    location: "جيم فتنس جلاكسي - شارع مكرم عبيد",
    image: "/imgs/gym_five.jpg",
    providerKey: "Ramy Elderaa",
    schedule: [
      { day: "الإثنين", times: ["5:00 مساء", "7:00 مساء"] },
      { day: "الأربعاء", times: ["6:00 مساء", "8:00 مساء"] }
    ]
  }
];

function getStoredJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function setStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  return getStoredJson(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  setStoredJson(STORAGE_KEYS.currentUser, user);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function loadUsers() {
  return getStoredJson(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  setStoredJson(STORAGE_KEYS.users, users);
}

function updateUserRecord(updatedUser, newPassword = "") {
  const users = loadUsers();
  const index = users.findIndex(item => item.id === updatedUser.id);
  if (index === -1) {
    return { ok: false, message: "لم يتم العثور على الحساب." };
  }

  const emailExists = users.some(item => item.email === updatedUser.email && item.id !== updatedUser.id);
  if (emailExists) {
    return { ok: false, message: "البريد الإلكتروني مستخدم بالفعل." };
  }

  const updated = {
    ...users[index],
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone
  };

  if (newPassword) {
    updated.password = newPassword;
  }

  users[index] = updated;
  saveUsers(users);

  setCurrentUser({
    id: updated.id,
    role: updated.role,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    providerId: updated.providerId || null
  });

  return { ok: true };
}

function updateBookingsForUser(userId, newName) {
  const bookings = loadBookings();
  let changed = false;
  bookings.forEach(booking => {
    if (booking.userId === userId) {
      booking.userName = newName;
      changed = true;
    }
  });
  if (changed) {
    saveBookings(bookings);
  }
}

function updateBookingsForProvider(providerId, newName) {
  const bookings = loadBookings();
  let changed = false;
  bookings.forEach(booking => {
    if (booking.providerId === providerId) {
      booking.providerName = newName;
      changed = true;
    }
  });
  if (changed) {
    saveBookings(bookings);
  }
}

function loadBookings() {
  return getStoredJson(STORAGE_KEYS.bookings, []);
}

function saveBookings(bookings) {
  setStoredJson(STORAGE_KEYS.bookings, bookings);
}

function slugify(value) {
  const normalized = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");

  return normalized || `provider-${Date.now()}`;
}

function buildProviderId(type, name) {
  return `${type}-${slugify(name)}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function ensureProviders() {
  let providers = getStoredJson(STORAGE_KEYS.providers, null);
  if (Array.isArray(providers) && providers.length) {
    return providers;
  }

  try {
    const response = await fetch(DEFAULT_PROVIDERS_URL);
    if (!response.ok) {
      throw new Error("Failed to load providers");
    }
    providers = await response.json();
  } catch (error) {
    providers = fallbackProviders;
  }

  setStoredJson(STORAGE_KEYS.providers, providers);
  return providers;
}

function saveProviders(providers) {
  setStoredJson(STORAGE_KEYS.providers, providers);
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function findProvider(providers, idOrKey) {
  if (!idOrKey) return null;
  return (
    providers.find(provider => provider.id === idOrKey) ||
    providers.find(provider => provider.providerKey === idOrKey) ||
    providers.find(provider => provider.displayName === idOrKey)
  );
}

function requireRole(role) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== role) {
    return null;
  }
  return currentUser;
}

function setupLogout(buttonId, redirectTo = "./index.html") {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener("click", () => {
    clearCurrentUser();
    window.location.href = redirectTo;
  });
}

function formatProviderTitle(type, name) {
  if (!name) return "";
  if (type === "clinic") return `د. ${name}`;
  if (type === "gym") return `كابتن ${name}`;
  if (type === "barber") return `الحلاق ${name}`;
  return name;
}

function getRoleLabel(role) {
  return role === "provider" ? "مقدم خدمة" : "مستخدم";
}

function initAuthPage() {
  const modeButtons = document.querySelectorAll("[data-mode]");
  const roleButtons = document.querySelectorAll("[data-role]");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const providerFields = document.querySelector(".provider-fields");
  const authMessage = document.getElementById("auth-message");
  const sessionActions = document.getElementById("session-actions");

  if (!loginForm || !registerForm) return;

  const params = new URLSearchParams(window.location.search);
  let currentMode = params.get("mode") || "login";
  let currentRole = params.get("role") || "user";

  const currentUser = getCurrentUser();
  if (currentUser && sessionActions) {
    sessionActions.innerHTML = `
      <div class="alert alert-info mb-3">
        أنت مسجل الدخول كـ ${getRoleLabel(currentUser.role)}.
      </div>
      <div class="d-flex flex-column flex-md-row gap-2">
        <a class="btn btn-primary" href="${currentUser.role === "provider" ? "./dashboard.html" : "./profile.html"}">الانتقال للحساب</a>
        <button class="btn btn-outline-secondary" id="logout-session">تسجيل الخروج</button>
      </div>
    `;
    const logoutButton = document.getElementById("logout-session");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        clearCurrentUser();
        window.location.reload();
      });
    }
  }

  function setMode(mode) {
    currentMode = mode;
    modeButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    loginForm.classList.toggle("d-none", mode !== "login");
    registerForm.classList.toggle("d-none", mode !== "register");
  }

  function setRole(role) {
    currentRole = role;
    roleButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.role === role);
    });
    if (providerFields) {
      providerFields.classList.toggle("d-none", role !== "provider");
      const providerInputs = providerFields.querySelectorAll("input, select, textarea");
      providerInputs.forEach(input => {
        const requiredForProvider = input.dataset.required === "provider";
        input.disabled = role !== "provider";
        if (requiredForProvider) {
          input.required = role === "provider";
        }
      });
    }
  }

  modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  roleButtons.forEach(button => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  setMode(currentMode);
  setRole(currentRole);

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const email = loginForm.querySelector("[name='email']").value.trim();
    const password = loginForm.querySelector("[name='password']").value.trim();
    const users = loadUsers();
    const user = users.find(item => item.email === email && item.password === password && item.role === currentRole);

    if (!user) {
      authMessage.textContent = "بيانات الدخول غير صحيحة.";
      authMessage.className = "alert alert-danger";
      return;
    }

    setCurrentUser({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      providerId: user.providerId || null
    });

    window.location.href = "./index.html";
  });

  registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const users = loadUsers();
    const name = registerForm.querySelector("[name='name']").value.trim();
    const email = registerForm.querySelector("[name='email']").value.trim();
    const phone = registerForm.querySelector("[name='phone']").value.trim();
    const password = registerForm.querySelector("[name='password']").value.trim();

    if (users.some(item => item.email === email)) {
      authMessage.textContent = "البريد الإلكتروني مستخدم بالفعل.";
      authMessage.className = "alert alert-warning";
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      role: currentRole,
      name,
      email,
      phone,
      password
    };

    if (currentRole === "provider") {
      const providers = await ensureProviders();
      const serviceType = registerForm.querySelector("[name='service_type']").value;
      const displayNameInput = registerForm.querySelector("[name='display_name']").value.trim();
      const location = registerForm.querySelector("[name='location']").value.trim();
      const imageInput = registerForm.querySelector("[name='image']");
      let image = "/imgs/reception.jpg";
      if (imageInput && imageInput.files && imageInput.files[0]) {
        try {
          image = await readFileAsDataUrl(imageInput.files[0]);
        } catch (error) {
          image = "/imgs/reception.jpg";
        }
      }

      const dayOne = registerForm.querySelector("[name='day_one']").value.trim();
      const timeOneA = registerForm.querySelector("[name='time_one_a']").value.trim();
      const timeOneB = registerForm.querySelector("[name='time_one_b']").value.trim();
      const dayTwo = registerForm.querySelector("[name='day_two']").value.trim();
      const timeTwoA = registerForm.querySelector("[name='time_two_a']").value.trim();
      const timeTwoB = registerForm.querySelector("[name='time_two_b']").value.trim();

      const providerName = displayNameInput || formatProviderTitle(serviceType, name);
      const providerId = buildProviderId(serviceType, providerName);

      const schedule = [];
      if (dayOne) {
        const times = [timeOneA, timeOneB].filter(Boolean);
        if (times.length) schedule.push({ day: dayOne, times });
      }
      if (dayTwo) {
        const times = [timeTwoA, timeTwoB].filter(Boolean);
        if (times.length) schedule.push({ day: dayTwo, times });
      }

      providers.push({
        id: providerId,
        type: serviceType,
        displayName: providerName,
        rating: 5,
        location,
        image,
        providerKey: providerId,
        schedule
      });

      saveProviders(providers);
      newUser.providerId = providerId;
    }

    users.push(newUser);
    saveUsers(users);

    setCurrentUser({
      id: newUser.id,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      providerId: newUser.providerId || null
    });

    window.location.href = "./index.html";
  });
}

function initHeaderAuthControls() {
  const loginButton = document.getElementById("header-login");
  const signupButton = document.getElementById("header-signup");
  const bookButton = document.getElementById("header-book");
  const accountButton = document.getElementById("header-account");

  if (!loginButton || !signupButton || !bookButton || !accountButton) return;

  const currentUser = getCurrentUser();
  if (currentUser) {
    loginButton.classList.add("d-none");
    signupButton.classList.add("d-none");
    bookButton.classList.remove("d-none");
    accountButton.classList.remove("d-none");
    accountButton.href = currentUser.role === "provider" ? "./dashboard.html" : "./profile.html";
  } else {
    loginButton.classList.remove("d-none");
    signupButton.classList.remove("d-none");
    bookButton.classList.add("d-none");
    accountButton.classList.add("d-none");
  }
}

async function initProvidersPage() {
  const container = document.getElementById("providers-grid");
  if (!container) return;

  const backButton = document.getElementById("providers-back");
  if (backButton) {
    backButton.addEventListener("click", () => window.history.back());
  }

  const accountButton = document.getElementById("providers-account");
  if (accountButton) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      accountButton.classList.remove("d-none");
      accountButton.href = currentUser.role === "provider" ? "./dashboard.html" : "./profile.html";
    } else {
      accountButton.classList.add("d-none");
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const providers = await ensureProviders();

  const filtered = providers.filter(provider => {
    return !type || type === "all" || provider.type === type;
  });

  if (!filtered.length) {
    container.innerHTML = "<p class='text-center'>لا يوجد مقدمو خدمة حاليا.</p>";
    return;
  }

  container.innerHTML = filtered
    .map(provider => {
      return `
        <div class="col-md-4 provider-card" data-type="${provider.type}">
          <div class="card">
            <img src="${provider.image}" class="card-img-top" alt="provider">
            <div class="card-body">
              <h5 class="card-title">${provider.displayName}</h5>
              <p class="text-warning">${renderStars(provider.rating)}</p>
              <p class="card-text">${provider.location}</p>
              <a href="booking.html?provider=${encodeURIComponent(provider.id)}" class="btn btn-primary">اختياره</a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function initBookingPage() {
  const container = document.getElementById("tables-container");
  const form = document.getElementById("bookingForm");
  if (!container || !form) return;

  const providerParam = new URLSearchParams(window.location.search).get("provider");
  const providers = await ensureProviders();
  const provider = findProvider(providers, providerParam);
  const loginRequired = document.getElementById("login-required");
  const selectedTime = document.getElementById("selectedTime");
  const hiddenTime = document.getElementById("hiddenTime");

  if (!provider) {
    container.innerHTML = "<p>لا يوجد جدول لهذا المقدم حاليًا.</p>";
    form.classList.add("d-none");
    return;
  }

  if (!provider.schedule || !provider.schedule.length) {
    container.innerHTML = `<h2 class="mb-3">${provider.displayName}</h2><p>لا توجد مواعيد متاحة حاليًا.</p>`;
    form.classList.add("d-none");
    return;
  }

  container.innerHTML = `
    <h2 class="mb-3">جدول المواعيد - ${provider.displayName}</h2>
    <table>
      <thead>
        <tr>
          <th>اليوم</th>
          <th colspan="3">الساعات</th>
        </tr>
      </thead>
      <tbody>
        ${provider.schedule
          .map(slot => {
            const times = slot.times.length ? slot.times : ["لا توجد مواعيد"];
            return `
              <tr>
                <th>${slot.day}</th>
                ${times
                  .map(time => {
                    const isDisabled = time === "لا توجد مواعيد";
                    const classes = isDisabled ? "time-slot is-disabled" : "time-slot";
                    return `<td class="${classes}" data-time="${slot.day}، ${time}" data-disabled="${isDisabled}">${time}</td>`;
                  })
                  .join("")}
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  const timeSlots = container.querySelectorAll(".time-slot");
  timeSlots.forEach(slot => {
    slot.addEventListener("click", () => {
      if (slot.dataset.disabled === "true") return;
      const currentUser = requireRole("user");
      if (!currentUser) {
        if (loginRequired) {
          loginRequired.classList.remove("d-none");
        }
        return;
      }
      if (loginRequired) {
        loginRequired.classList.add("d-none");
      }

      const time = slot.dataset.time;
      form.classList.remove("d-none");
      selectedTime.innerText = `الموعد: ${time}`;
      hiddenTime.value = time;

      const nameInput = form.querySelector("[name='user_name']");
      const phoneInput = form.querySelector("[name='user_phone']");
      const emailInput = form.querySelector("[name='user_email']");

      nameInput.value = currentUser.name || "";
      phoneInput.value = currentUser.phone || "";
      emailInput.value = currentUser.email || "";

      window.scrollTo({ top: form.offsetTop, behavior: "smooth" });
    });
  });

  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAIL_PUBLIC_KEY);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const currentUser = requireRole("user");
    if (!currentUser) {
      if (loginRequired) {
        loginRequired.classList.remove("d-none");
      }
      return;
    }

    const booking = {
      id: `booking-${Date.now()}`,
      providerId: provider.id,
      providerName: provider.displayName,
      userId: currentUser.id,
      userName: currentUser.name,
      time: hiddenTime.value,
      createdAt: new Date().toISOString()
    };

    const bookings = loadBookings();
    bookings.push(booking);
    saveBookings(bookings);

    if (typeof emailjs !== "undefined") {
      emailjs.sendForm("service_c2rio53", "template_1mqaagj", form).catch(() => {});
    }

    const toastElement = document.getElementById("liveToast");
    if (toastElement && typeof bootstrap !== "undefined") {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }

    form.reset();
    form.classList.add("d-none");
  });
}

async function initDashboardPage() {
  const user = requireRole("provider");
  const wrapper = document.getElementById("dashboard-wrapper");
  const tableBody = document.getElementById("provider-bookings");
  const editForm = document.getElementById("provider-edit-form");
  const editMessage = document.getElementById("provider-edit-message");
  if (!wrapper || !tableBody) return;

  if (!user) {
    wrapper.innerHTML = `
      <div class="alert alert-warning">يجب تسجيل الدخول كمقدم خدمة للوصول إلى هذه الصفحة.</div>
      <a class="btn btn-primary" href="./auth.html?role=provider">الانتقال لتسجيل الدخول</a>
    `;
    return;
  }

  const providers = await ensureProviders();
  const provider = providers.find(item => item.id === user.providerId);

  if (!provider) {
    wrapper.innerHTML = "<div class='alert alert-danger'>لم يتم العثور على بيانات مقدم الخدمة.</div>";
    return;
  }

  const bookings = loadBookings().filter(item => item.providerId === provider.id);
  const infoCard = document.getElementById("provider-info");
  if (infoCard) {
    infoCard.innerHTML = `
      <div>
        <h4>${provider.displayName}</h4>
        <p class="text-muted mb-1">${provider.location}</p>
        <span class="badge bg-primary">${provider.type === "gym" ? "صالة رياضية" : provider.type === "clinic" ? "عيادة" : "حلاق"}</span>
      </div>
      <div class="text-warning fs-5">${renderStars(provider.rating)}</div>
    `;
  }

  if (editForm) {
    editForm.querySelector("[name='display_name']").value = provider.displayName || "";
    editForm.querySelector("[name='service_type']").value = provider.type || "gym";
    editForm.querySelector("[name='location']").value = provider.location || "";

    const schedule = provider.schedule || [];
    const first = schedule[0] || { day: "", times: [] };
    const second = schedule[1] || { day: "", times: [] };

    editForm.querySelector("[name='day_one']").value = first.day || "";
    editForm.querySelector("[name='time_one_a']").value = first.times[0] || "";
    editForm.querySelector("[name='time_one_b']").value = first.times[1] || "";
    editForm.querySelector("[name='day_two']").value = second.day || "";
    editForm.querySelector("[name='time_two_a']").value = second.times[0] || "";
    editForm.querySelector("[name='time_two_b']").value = second.times[1] || "";

    editForm.querySelector("[name='account_name']").value = user.name || "";
    editForm.querySelector("[name='account_email']").value = user.email || "";
    editForm.querySelector("[name='account_phone']").value = user.phone || "";

    editForm.addEventListener("submit", async event => {
      event.preventDefault();

      const displayName = editForm.querySelector("[name='display_name']").value.trim();
      const serviceType = editForm.querySelector("[name='service_type']").value;
      const location = editForm.querySelector("[name='location']").value.trim();
      const imageInput = editForm.querySelector("[name='image']");
      const accountName = editForm.querySelector("[name='account_name']").value.trim();
      const accountEmail = editForm.querySelector("[name='account_email']").value.trim();
      const accountPhone = editForm.querySelector("[name='account_phone']").value.trim();
      const accountPassword = editForm.querySelector("[name='account_password']").value.trim();

      if (!displayName || !location || !accountName || !accountEmail || !accountPhone) {
        if (editMessage) {
          editMessage.textContent = "يرجى ملء الحقول المطلوبة.";
          editMessage.className = "alert alert-warning";
        }
        return;
      }

      let image = provider.image || "/imgs/reception.jpg";
      if (imageInput && imageInput.files && imageInput.files[0]) {
        try {
          image = await readFileAsDataUrl(imageInput.files[0]);
        } catch (error) {
          image = provider.image || "/imgs/reception.jpg";
        }
      }

      const dayOne = editForm.querySelector("[name='day_one']").value.trim();
      const timeOneA = editForm.querySelector("[name='time_one_a']").value.trim();
      const timeOneB = editForm.querySelector("[name='time_one_b']").value.trim();
      const dayTwo = editForm.querySelector("[name='day_two']").value.trim();
      const timeTwoA = editForm.querySelector("[name='time_two_a']").value.trim();
      const timeTwoB = editForm.querySelector("[name='time_two_b']").value.trim();

      const schedule = [];
      if (dayOne) {
        const times = [timeOneA, timeOneB].filter(Boolean);
        schedule.push({ day: dayOne, times });
      }
      if (dayTwo) {
        const times = [timeTwoA, timeTwoB].filter(Boolean);
        schedule.push({ day: dayTwo, times });
      }

      const providers = await ensureProviders();
      const providerIndex = providers.findIndex(item => item.id === provider.id);
      if (providerIndex === -1) {
        if (editMessage) {
          editMessage.textContent = "تعذر تحديث بيانات مقدم الخدمة.";
          editMessage.className = "alert alert-danger";
        }
        return;
      }

      providers[providerIndex] = {
        ...providers[providerIndex],
        displayName,
        type: serviceType,
        location,
        image,
        schedule
      };

      saveProviders(providers);
      updateBookingsForProvider(provider.id, displayName);

      const userUpdate = updateUserRecord(
        {
          id: user.id,
          role: user.role,
          name: accountName,
          email: accountEmail,
          phone: accountPhone,
          providerId: user.providerId
        },
        accountPassword
      );

      if (!userUpdate.ok) {
        if (editMessage) {
          editMessage.textContent = userUpdate.message;
          editMessage.className = "alert alert-warning";
        }
        return;
      }

      updateBookingsForUser(user.id, accountName);

      if (editMessage) {
        editMessage.textContent = "تم تحديث البيانات بنجاح.";
        editMessage.className = "alert alert-success";
      }

      window.location.reload();
    });
  }

  tableBody.innerHTML = bookings.length
    ? bookings
        .map((booking, index) => {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${booking.userName}</td>
              <td>${booking.time}</td>
              <td>${new Date(booking.createdAt).toLocaleDateString("ar-EG")}</td>
            </tr>
          `;
        })
        .join("")
    : "<tr><td colspan='4' class='text-center'>لا توجد حجوزات بعد.</td></tr>";

  setupLogout("provider-logout");
}

function initProfilePage() {
  const user = requireRole("user");
  const wrapper = document.getElementById("profile-wrapper");
  const bookingsBody = document.getElementById("user-bookings");
  const editForm = document.getElementById("user-edit-form");
  const editMessage = document.getElementById("user-edit-message");
  if (!wrapper || !bookingsBody) return;

  if (!user) {
    wrapper.innerHTML = `
      <div class="alert alert-warning">يجب تسجيل الدخول كمستخدم للوصول إلى هذه الصفحة.</div>
      <a class="btn btn-primary" href="./auth.html?role=user">الانتقال لتسجيل الدخول</a>
    `;
    return;
  }

  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-email").textContent = user.email;
  document.getElementById("user-phone").textContent = user.phone;

  if (editForm) {
    editForm.querySelector("[name='name']").value = user.name || "";
    editForm.querySelector("[name='email']").value = user.email || "";
    editForm.querySelector("[name='phone']").value = user.phone || "";

    editForm.addEventListener("submit", event => {
      event.preventDefault();
      const name = editForm.querySelector("[name='name']").value.trim();
      const email = editForm.querySelector("[name='email']").value.trim();
      const phone = editForm.querySelector("[name='phone']").value.trim();
      const password = editForm.querySelector("[name='password']").value.trim();

      if (!name || !email || !phone) {
        if (editMessage) {
          editMessage.textContent = "يرجى ملء الحقول المطلوبة.";
          editMessage.className = "alert alert-warning";
        }
        return;
      }

      const result = updateUserRecord(
        {
          id: user.id,
          role: user.role,
          name,
          email,
          phone,
          providerId: user.providerId
        },
        password
      );

      if (!result.ok) {
        if (editMessage) {
          editMessage.textContent = result.message;
          editMessage.className = "alert alert-warning";
        }
        return;
      }

      updateBookingsForUser(user.id, name);

      if (editMessage) {
        editMessage.textContent = "تم تحديث البيانات بنجاح.";
        editMessage.className = "alert alert-success";
      }

      window.location.reload();
    });
  }

  const bookings = loadBookings().filter(item => item.userId === user.id);
  bookingsBody.innerHTML = bookings.length
    ? bookings
        .map((booking, index) => {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${booking.providerName}</td>
              <td>${booking.time}</td>
              <td>${new Date(booking.createdAt).toLocaleDateString("ar-EG")}</td>
            </tr>
          `;
        })
        .join("")
    : "<tr><td colspan='4' class='text-center'>لا توجد حجوزات حتى الآن.</td></tr>";

  setupLogout("user-logout");
}

document.addEventListener("DOMContentLoaded", () => {
  initHeaderAuthControls();
  const page = document.body.getAttribute("data-page");
  if (page === "auth") initAuthPage();
  if (page === "providers") initProvidersPage();
  if (page === "booking") initBookingPage();
  if (page === "dashboard") initDashboardPage();
  if (page === "profile") initProfilePage();
});
