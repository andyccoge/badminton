<script setup>
  import { inject, computed } from 'vue';
  import * as Icon from '@heroicons/vue/24/outline';

  const props = defineProps({
    users: Array,
    user: Object,
  });
  const toggle_menu_open_left =  inject('toggle_menu_open_left');
  const users_by_teams = inject('users_by_teams') ? inject('users_by_teams') : [];
  const alert_wait = inject('alert_wait') ? inject('alert_wait') : 999;

  const show_name = computed(()=> { return props.user.nick ? props.user.nick : props.user.name});

  const select_user = inject('select_user') ? inject('select_user') : ()=>{};
  const check_on_court = inject('check_on_court') ? inject('check_on_court') : ()=>{return false;};
  const grouping_users_mode = inject('grouping_users_mode') ? inject('grouping_users_mode') : false;
  const team_select_uesr_ids = inject('team_select_uesr_ids') ? inject('team_select_uesr_ids') : [];

  const bottom_nav_more = inject('bottom_nav_more') ? inject('bottom_nav_more') : false;

  const get_user_index = (user_id) => {
    for (let i = 0; i < props.users.length; i++) {
      if(props.users[i].id==user_id){
        return i;
      }
    }
    return -1;
  }
</script>

<template>
  <div class="py-2 px-2 m-0.5 inline-block rounded-md relative cursor-pointer"
        :class="[ 
          user.status==1 && !grouping_users_mode ?'opacity-30' : '',
          props.user.gender=='女' ?'bg-red-300 border-red-400' : 'bg-blue-300 border-blue-400',
          check_on_court(props.user.id, 0) && !grouping_users_mode ? 'border-2 border-yellow-400 shadow-md shadow-yellow-400' : 'border-2',
          team_select_uesr_ids.indexOf(user.id)!=-1 && grouping_users_mode ? 'border-2 border-yellow-400 shadow-md shadow-yellow-400' : 'border-2',
        ]"
        @click.self="select_user(get_user_index(user.id))">
    <template v-for="(team, team_index) in users_by_teams">
      <template v-if="team.indexOf(user.id)!=-1">
        <span class="alert_dot text-white bg-black rounded-2xl p-0.5 text-center absolute" v-text="team_index+1" style="width: 27px;"></span>
      </template>
    </template>
    <span class="alert_dot flex h-3 w-3 absolute" v-if="props.user.wait > alert_wait">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
    </span>
    <div class="flex" :class="[bottom_nav_more ? 'flex-col' : '']" @click.self="select_user(get_user_index(user.id))">
      <span class="pr-2" v-text="show_name" @click="select_user(get_user_index(user.id))"></span>
      <div class="flex align-center justify-between min-w-min">
        <span class="" @click="select_user(get_user_index(user.id))" v-if="bottom_nav_more">
          完賽：<span v-text="user.played"></span>
        </span>
        <button class="ml-2" @click="toggle_menu_open_left(get_user_index(user.id))" v-if="toggle_menu_open_left">
          <Icon.EyeIcon class="h-5 w-5 text-black"></Icon.EyeIcon>
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