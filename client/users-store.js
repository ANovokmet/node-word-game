import { writable } from 'svelte/store';

export const store = writable({});

export function connect(socket) {
    socket.on('users', (data) => {
        const users = {};
        for (const user of data) {
            users[user.userId] = user;
        }
        store.set(users);
    });

    socket.on('user_connected', (data) => {
        store.update(users => ({
            ...users,
            [data.userId]: data
        }));
    });

    socket.on('user_disconnected', (data) => {
        store.update(users => {
            const { [data.userId]: removed, ...rest } = users;
            return rest;
        });
    });

    socket.on('username_change', data => {
        store.update(users => ({
            ...users,
            [data.userId]: { ...users[data.userId], ...data }
        }));
    });

    socket.on('score_update', data => {

        store.update(users => {
            for (const userId in data) {
                users[userId].score = data[userId];
            }
            return users;
        });
    });

    return store;
}