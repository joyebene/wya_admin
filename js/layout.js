const layout = `
    <!-- Sidebar -->
    <aside class="w-72 bg-black text-white p-6 hidden md:block sticky top-0 h-screen">
        <h1 class="text-2xl font-bold text-yellow-400 mb-10">Wadada Admin</h1>
        <nav class="space-y-3">
            <a href="dashboard.html" class="sidebar-link">Dashboard</a>
            <a href="members.html" class="sidebar-link">All Members</a>
            <a href="event-man.html" class="sidebar-link">Events</a>
            <a href="gallery-man.html" class="sidebar-link">Gallery</a>
            <a href="settings.html" class="sidebar-link">Settings</a>
            <a href="#" id="logout-button" class="sidebar-link text-red-400 hover:bg-red-500 hover:text-white">
                Logout
            </a>
        </nav>
    </aside>

    <main class="flex-1 overflow-y-auto bg-[#f8f8f8] p-6 md:p-10">
        <div id="main-content"></div>
    </main>
`;

document.addEventListener('DOMContentLoaded', async () => {
    // Check for access token. If not present, redirect to login.
    // This check should happen before any layout is rendered.
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
        return; // Stop execution to prevent rendering the layout
    }

    const bodyFlex = document.querySelector('body > .flex');
    if (!bodyFlex) return;

    const pageContent = bodyFlex.innerHTML;
    bodyFlex.innerHTML = layout;
    document.getElementById('main-content').innerHTML = pageContent;

    // Set active link 
     let  currentFile = window.location.pathname.split('/').pop() || 'dashboard.html'; 
     if (currentFile === 'event-details.html') { 
         currentFile = 'event-man.html'; 
     } 
     document.querySelectorAll('.sidebar-link').forEach( link  => { 
         if (link.getAttribute('href') === currentFile) { 
             link.classList.add('active-link'); 
         } 
     });

    // Logout handler now uses the new api.logout() method
    document.getElementById('logout-button').addEventListener('click', async (e) => {
        e.preventDefault();
        await api.logout();
    });

    // Optional: You can still have a check to verify the token is valid
    try {
       await api.get('/admin/dashboard-summary');
    } catch (error) {
        console.error("Auth check failed:", error);
        // The api._fetchWithAuth will handle redirection if the token is invalid/expired
    }
});