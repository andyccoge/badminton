<script setup>
  import { ref, inject, computed } from 'vue';

  const props = defineProps({
    user: Object,
    user_index: Number,
  });
  const toggle_menu_open_left = inject('toggle_menu_open_left');
  const alert_wait = inject('alert_wait') ? inject('alert_wait') : 999;

  const show_name = computed(()=> { return props.user.nick ? props.user.nick : props.user.name});

  const select_user = inject('select_user') ? inject('select_user') : (user_index)=>{return user_index;};
  const check_on_court = inject('check_on_court') ? inject('check_on_court') : ()=>{return false;};
  const grouping_users_mode = inject('grouping_users_mode') ? inject('grouping_users_mode') : false;
  const team_select_uesr_ids = inject('team_select_uesr_ids') ? inject('team_select_uesr_ids') : [];

  const bottom_nav_more = inject('bottom_nav_more') ? inject('bottom_nav_more') : false;
</script>

<template>
  <div class="py-2 px-2 m-0.5 inline-block rounded-md relative cursor-pointer"
        :class="[ 
          user.status==1 && !grouping_users_mode ?'opacity-30' : '',
          props.user.gender=='女' ?'bg-red-300 border-red-400' : 'bg-blue-300 border-blue-400',
          check_on_court(props.user.id, 0) && !grouping_users_mode ? 'border-2 border-yellow-400 shadow-md shadow-yellow-400' : 'border-2',
          team_select_uesr_ids.indexOf(user.id)!=-1 && grouping_users_mode ? 'border-2 border-yellow-400 shadow-md shadow-yellow-400' : 'border-2',
        ]"
        @click.self="select_user(user_index)">
    <span class="alert_dot flex h-3 w-3 absolute" v-if="props.user.wait > alert_wait">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
    </span>
    <div class="flex" :class="[!grouping_users_mode && bottom_nav_more ? 'flex-col' : '']" @click.self="select_user(user_index)">
      <span class="pr-2" v-text="show_name" @click="select_user(user_index)"></span>
      <div class="flex align-center justify-between min-w-min">
        <span class="" @click="select_user(user_index)" v-if="!grouping_users_mode && bottom_nav_more">
          完賽：<span v-text="user.played"></span>
        </span>
        <button class="ml-2" @click="toggle_menu_open_left(user_index)" v-if="toggle_menu_open_left">
          <svg class="h-5 w-5 text-black"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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