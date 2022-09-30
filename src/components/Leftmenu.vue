<script setup>
    import '../assets/tailwind.css';
    import { inject } from 'vue';

    const menu_open_left = inject('menu_open_left');
    const toggle_menu_open_left = inject('toggle_menu_open_left');

    const users = inject('users');
    const user_view_index = inject('user_view_index');
    const userModal_open = inject('userModal_open');
    const user_delete = inject('user_delete');
</script>

<template>
    <Transition>
        <div v-if="menu_open_left" class="modal-mask" @click.self="toggle_menu_open_left(-1)">
            <nav class="p-4" :class="[users[user_view_index].gender=='女'? 'bg-red-300' : 'bg-blue-300']">
                <button
                class="absolute right-0 top-0 p-1"
                @click="toggle_menu_open_left(-1)"
                >
                    <svg class="h-6 w-6 text-black bg-white rounded-full"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </button>
                <div class="nav_content h-full bg-white p-4 rounded-md">
                    <div class="nav_content_inner h-full">
                        <h3 class="font-bold text-xl mb-2">詳細資料</h3>
                        <p>姓名：{{users[user_view_index].name}}</p>
                        <p>綽號：{{users[user_view_index].nick}}</p>
                        <p>性別：{{users[user_view_index].gender}}</p>
                        <p>等級：{{users[user_view_index].level}}</p>
                        <p>電話：{{users[user_view_index].phone}}</p>
                        <p>信箱：{{users[user_view_index].email}}</p>
                        <hr class="my-3">
                        <p>今日比賽場數：{{users[user_view_index].played}}</p>
                        <p>等待場數：{{users[user_view_index].wait}}</p>
                        <p>
                            狀態：
                            <span v-if="users[user_view_index].status==1">場上</span>
                            <span v-else >閒置</span>
                        </p>
                        <hr class="my-3">
                        <div class="flex justify-between">
                            <div>
                                <button class="mx-2" @click="userModal_open(user_view_index)">
                                    <svg class="h-5 w-5 text-black"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </button>
                            </div>
                            <button class="mx-2" @click="user_delete(user_view_index)">
                                <svg class="h-5 w-5 text-black"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </Transition>
</template>

<style scoped>
    nav{
        position: fixed;
        width: 60%;
        height: 100%;
        max-width: 400px;
        z-index: 15;
        box-shadow: 0 0px 20px rgb(0 0 0 / 33%);
    }
    .nav_content{
        overflow-x: scroll;
    }
    .nav_content_inner{
        min-width: 140px;
    }

    .modal-mask {
      position: fixed;
      z-index: 15;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: table;
      transition: opacity 0.3s ease;
    }

    .v-enter-active,
    .v-leave-active {
    transition: opacity 0.5s ease;
    }

    .v-enter-from,
    .v-leave-to {
    opacity: 0;
    }

    .v-enter-active nav,
    .v-leave-active nav{
        transition-duration: 0.5s;
        left: 0%;
    }

    .v-enter-from nav,
    .v-leave-to nav{
        left: -50%;
    }

    @media only screen and (min-width: 976px){
        nav{
            width: 30%;
        }
        .v-enter-from nav,
        .v-leave-to nav{
            left: -30%;
        }
    }
</style>
  