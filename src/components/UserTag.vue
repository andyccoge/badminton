<script setup>
  import { inject, computed } from 'vue';
  import * as Icon from '@heroicons/vue/24/outline';

  const props = defineProps({
    user: Object,
    user_index: Number,
  });
  const toggle_menu_open_left_id =  inject('toggle_menu_open_left_id');
  const menu_open_left_id = (user_id) => {
    if(toggle_menu_open_left_id){ 
      toggle_menu_open_left_id(user_id);
      setTimeout(()=>{
        let class_text = document.querySelector('.left_menu').getAttribute('class') + ' very_front ';
        document.querySelector('.left_menu').setAttribute('class', class_text);
      }, 100);
    }
  }
  const show_name = computed(()=> { return props.user.nick ? props.user.nick : props.user.name});

  const emit = defineEmits(['select_user']);
</script>

<template>
  <div class="rounded-md inline-block relative py-2 px-2 cursor-pointer"
        :class="[ 
          user.check_in!=1 ? 'opacity-30' : '',
          props.user.gender=='女' ?'bg-red-300 border-red-400' : 'bg-blue-300 border-blue-400',
        ]"
        @click.self="emit('select_user', user_index)">
    <div class="flex"  @click.self="emit('select_user', user_index)">
      <span class="inline-flex" @click="emit('select_user', user_index)">
        <span v-text="show_name" class="line-clamp-1" style="max-width: 65px;"></span>
        (<span v-text="props.user.level"></span>)
      </span>
      <div class="flex align-center justify-between min-w-min" @click.self="emit('select_user', user_index)">
        <button class="ml-2" @click="menu_open_left_id(user.id)" v-if="toggle_menu_open_left_id">
          <Icon.EyeIcon class="h-5 w-5 text-black"></Icon.EyeIcon>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>