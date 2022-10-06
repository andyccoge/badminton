<script setup>
    import '../assets/tailwind.css'
    import { ref, provide, inject, readonly } from 'vue';
    import User from './User.vue';
    
    const users = inject('users');
    const users_by_teams = inject('users_by_teams');
    const courts = inject('courts');

    const court_chage_user_reset = inject('court_chage_user_reset');
    let menu_open = inject('menu_open_bottom') ? inject('menu_open_bottom') : ref(false);
    const toggle_menu_open =()=>{
        if(court_chage_user_reset){ court_chage_user_reset(); }
        if(menu_open.value){
            menu_open.value = false;
            grouping_users_toggle(-1);
        }else{
            menu_open.value = true;
        }
    }

    let bottom_nav_more = inject('bottom_nav_more') ? inject('bottom_nav_more') : ref(true);
    const toggle_bottom_nav_more =()=>{
        bottom_nav_more.value = bottom_nav_more.value ? false : true;
    }

    const init_alert_wait = courts.filter(court => court.type==1).length;
    let alert_wait = ref(init_alert_wait);
    provide('alert_wait', readonly(alert_wait));

    const grouping_users_mode = inject('grouping_users_mode');
    const grouping_users_toggle = inject('grouping_users_toggle');
    const grouping_users = inject('grouping_users');
    
    let userModal_open = inject('userModal_open');
</script>

<template>
    <div class="bottom_nav_leave_blank pt-12"></div>
    <nav>
        <div class="btn absolute w-full">
            <div class="container mx-auto">
                <button class="w-full font-bold py-2 px-4 border-b-4 rounded-t-lg text-white relative"
                        :class="[grouping_users_mode ? 'bg-black hover:bg-black  border-black hover:border-black' : 'bg-red-500 hover:bg-red-400  border-red-700']"
                        @click.self="toggle_menu_open">
                    人員面板
                    <span v-if="grouping_users_mode">(群組模式)</span>
                    <span class="absolute left-2" v-if="!grouping_users_mode">
                        <button class="" v-if="!bottom_nav_more" @click="toggle_bottom_nav_more">
                            <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="9" cy="5" r="1" />  <circle cx="9" cy="12" r="1" />  <circle cx="9" cy="19" r="1" />  <circle cx="15" cy="5" r="1" />  <circle cx="15" cy="12" r="1" />  <circle cx="15" cy="19" r="1" /></svg>
                        </button>
                        <button class="" v-if="bottom_nav_more" @click="toggle_bottom_nav_more">
                            <svg class="h-5 w-5 text-white"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="1" />  <circle cx="12" cy="5" r="1" />  <circle cx="12" cy="19" r="1" /></svg>    
                        </button>
                    </span>
                    <span class="absolute right-2">
                        <button class="mx-2" @click="grouping_users_toggle">
                            <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                            </svg>
                        </button>
                        <button class="" @click="userModal_open(-1)">
                            <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                            </svg>
                        </button>
                    </span>                    
                </button>
            </div>
        </div>
        <Transition>
            <div class="border-4 border-b-0 rounded-t-lg px-3 py-2 bg-white" v-if="menu_open"
                 :class="[grouping_users_mode ? 'border-black' : 'border-red-700']">
                 <div class="nav_content">
                    <div v-for="(team, team_index) in users_by_teams" class="inline-block pt-1 pr-0.5">
                        <div :class="[team_index!=0 ? 'inline-block border-2 border-black rounded' : '' ]">
                            <template v-for="user_id in team">
                                <template v-for="(user, user_index) in users">
                                    <User v-if="user_id == user.id"
                                        :user="user"
                                        :user_index="user_index">
                                    </User>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="grid lg:grid-cols-2 md:grid-cols-1" v-if="!grouping_users_mode && bottom_nav_more">
                    <div>
                        ※透明表示目前正在場上，但仍可安排上場<br>
                        ※黃框表示有排上預備場<br>
                        ※點擊場地人員區塊即可開始指派人員
                    </div>
                    <div class="flex items-end justify-end">
                        等候場數提示：<input type="number" class="form-input px-1 py-1 rounded" min="0" v-model="alert_wait"/>
                    </div>
                </div>
                <button class="my-2 w-full font-bold py-2 px-4 rounded-md text-white bg-black" v-if="grouping_users_mode"
                        @click="grouping_users">
                    將所選人員建成群組
                </button>
            </div>
        </Transition>
    </nav>
    <div v-if="menu_open" class="bottom_nav_open_leave_blank"></div>
</template>

<style scoped>
    nav{
        position: fixed;
        width: 100%;
        z-index: 10;
        bottom: 0;
    }
    nav div.btn{
        top: -42px
    }

    .nav_content{
        overflow-y: scroll;
    }
    .bottom_nav_open_leave_blank,
    .nav_content{
        height: 50vh;
    }
    .v-enter-active,
    .v-leave-active{
        transition-duration: 0.5s;
        height: 50vh;
    }

    @media only screen and (min-width: 976px){
        .bottom_nav_open_leave_blank,
        .nav_content{
            height: 30vh;
        }
        .v-enter-active,
        .v-leave-active{
            transition-duration: 0.1s;
            height: 30vh;
        }
    }

    .v-enter-from,
    .v-leave-to{
        height: 0px;
        
    }
</style>
  