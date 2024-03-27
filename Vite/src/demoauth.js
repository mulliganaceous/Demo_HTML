import localforage from "localforage";

let count = 0;

export function getCount() {
    return { count };
}

export function increment() {
    count += 1
}

export async function getUser() {
    let user = await localforage.getItem("user");
    let content = {user: user};
    return content;
}

export function login(user) {
    if (user)
        return localforage.setItem("user", user);
    else {
        return false;
    }
}

export function logout() {
    return localforage.setItem("user", null);
}