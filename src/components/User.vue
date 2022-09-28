<script setup>
    import { ref, inject, computed } from 'vue';
    
    const props = defineProps({
        user: Object,
        user_index: Number,
    });
    const toggle_menu_open_left = inject('toggle_menu_open_left');
    const alert_wait = inject('alert_wait');
    
    const show_name = computed(()=> { return props.user.nick ? props.user.nick : props.user.name});
    
    const select_user = inject('select_user');
    const userModal_open = inject('userModal_open');
    const check_on_court = inject('check_on_court');
</script>

<template>
    <div class="py-2 px-2 m-1 inline-block rounded-md relative cursor-pointer"
         :class="[ 
            props.user.gender=='女' ?'bg-red-300 border-red-400' : 'bg-blue-300 border-blue-400',
            check_on_court(props.user.id, 0) ?'border-2 border-yellow-400 shadow-md shadow-yellow-400' : 'border-2',
         ]"
         @click.self="select_user(user_index)"
        >
        <span class="alert_dot flex h-3 w-3 absolute" v-if="props.user.wait > alert_wait">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <div class="">
            <div v-text="show_name" @click="select_user(user_index)"></div>
            <div class="flex align-center justify-between min-w-min">
                <span class="" @click="select_user(user_index)">等待：<span v-text="user.wait"></span></span>
                <button class="ml-2" @click="toggle_menu_open_left(user_index)">
                    <svg class="h-5 w-5 text-black"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                </button>
                <button class="ml-2" @click="userModal_open(user_index)">
                    <svg class="h-5 w-5 text-black"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .alert_dot{
        top: -5px;
        right: -5px;
    }
</style>