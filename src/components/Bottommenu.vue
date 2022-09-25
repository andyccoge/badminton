<script setup>
    import '../assets/tailwind.css'
    import { ref, provide, inject, readonly } from 'vue';
    import User from './User.vue';

    const users = inject('users');
    const courts = inject('courts');
    
    const court_chage_user_reset = inject('court_chage_user_reset');
    let menu_open = inject('menu_open_bottom') ? inject('menu_open_bottom') : ref(false);
    const toggle_menu_open =()=>{
        if(court_chage_user_reset){ court_chage_user_reset(); }
        if(menu_open.value){
            menu_open.value = false;
        }else{
            menu_open.value = true;
        }
    }

    const init_alert_wait = courts.filter(court => court.type==1).length;
    let alert_wait = ref(init_alert_wait);
    provide('alert_wait', readonly(alert_wait));

    let userModal_open = inject('userModal_open');
</script>

<template>
    <nav>
        <div class="btn absolute w-full">
            <div class="container mx-auto">
                <button class="w-full font-bold py-2 px-4 border-b-4 rounded-t-lg
                            bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500"
                        @click.self="toggle_menu_open">
                    人員面板
                    <button class="float-right" @click="userModal_open(-1)">
                        <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                    </button>
                </button>
            </div>
        </div>
        <Transition>
            <div v-if="menu_open" class="nav_content border-4 border-b-0 rounded-t-lg border-red-700 bg-white">
                <div class="px-3 pt-2">
                    <User v-for="(user, user_index) in users"
                        :class="{'opacity-30' : user.status==1}"
                        :user="user"
                        :user_index="user_index">
                    </User>
                </div>

                <div class="grid lg:grid-cols-2 md:grid-cols-1 py-1 px-2">
                    <div>
                        ※透明表示目前正在場上，但仍可安排上場<br>
                        ※黃框表示有排上預備場<br>
                        ※點擊場地人員區塊即可開始指派人員
                    </div>
                    <div class="flex items-end justify-end">
                        等候場數提示：<input type="number" class="form-input px-1 py-1 rounded" min="0" v-model="alert_wait"/>
                    </div>
                </div>   
            </div>
        </Transition>
    </nav>
</template>

<style scoped>
    nav{
        position: fixed;
        width: 100%;
        z-index: 10;
        bottom: 0;
    }
    nav div.btn{
        top: -44px;
    }

    .nav_content{
        overflow-y: scroll;
        height: 80vh;
    }
    .v-enter-active,
    .v-leave-active{
        transition-duration: 0.5s;
        height: 80vh;
    }

    @media only screen and (min-width: 976px){
        .nav_content{
            height: 30vh;
        }
        .v-enter-active,
        .v-leave-active{
            transition-duration: 0.5s;
            height: 30vh;
        }
    }

    .v-enter-from,
    .v-leave-to{
        height: 0px;
        
    }
</style>
  