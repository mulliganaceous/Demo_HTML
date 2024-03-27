# React + Vite

This is a simple demo program demonstrating three routes (Home/Dashboard/Contact), and a pseudo-login system.

This is built from the tutorial __React Router__ program. I have added a `demoauth.js` to implement a pseudo-authentication system. Login and logout are simply supplied through the `demoauth.js` script. The redirect algorithm is simply found in the loader of the `dashboard.jsx` file, where the router redirects the user back to Contacts in case if the currently logged-in user is null. One logs in by favoriting the user, and logs out by unfavoriting or deleting the user.
