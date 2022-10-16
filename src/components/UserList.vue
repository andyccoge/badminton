<script setup>
  // import { ref, reactive, inject, provide} from 'vue';
  // import { useToast } from "vue-toastification";
  // import Firebase from '../components/Firebase.vue';
  // import ModalFirebase from '../components/ModalFirebase.vue';
  import * as functions from '../functions.js';
  import * as Icon from '@heroicons/vue/24/outline';
  // const toast = useToast();
  // const swal = inject('$swal');

  const props = defineProps({
    users: Array,
  })
  const emit = defineEmits(['userModal_open', 'user_delete']);
</script>

<template>
  <div class="table_container">
    <table class="w-full flex flex-row flex-no-wrap sm:bg-white sm:shadow-lg">
      <thead class="text-white">
        <tr v-if="props.users.length==0"
            class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
          <th class="border-grey-light border p-2 sm:border-0 text-right">序號</th>
          <th class="border-grey-light border p-2 sm:border-0">ID</th>
          <th class="border-grey-light border p-2 sm:border-0">姓名</th>
          <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
          <th class="border-grey-light border p-2 sm:border-0">性別</th>
          <th class="border-grey-light border p-2 sm:border-0 text-right">等級</th>
          <th class="border-grey-light border p-2 sm:border-0">電話</th>
          <th class="border-grey-light border p-2 sm:border-0">信箱</th>
          <th class="border-grey-light border p-2 sm:border-0">操作</th>
        </tr>
        <tr v-for="(user, index) in props.users"
            class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
          <th class="border-grey-light border p-2 sm:border-0 text-right">序號</th>
          <th class="border-grey-light border p-2 sm:border-0">ID</th>
          <th class="border-grey-light border p-2 sm:border-0">姓名</th>
          <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
          <th class="border-grey-light border p-2 sm:border-0">性別</th>
          <th class="border-grey-light border p-2 sm:border-0 text-right">等級</th>
          <th class="border-grey-light border p-2 sm:border-0">電話</th>
          <th class="border-grey-light border p-2 sm:border-0">信箱</th>
          <th class="border-grey-light border p-2 sm:border-0">操作</th>
        </tr>
      </thead>
      <tbody class="flex-1 sm:flex-none">
        <tr v-for="(user, index) in props.users" class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0"
            :class="[user.gender=='女' ?'bg-red-100 hover:bg-red-200' : 'bg-blue-100 hover:bg-blue-200']">
          <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
          <td class="border-grey-light border p-2">
            <div class="flex items-center">
              <a class="text-blue-500" href="###" @click="emit('userModal_open', index)"><span v-text="user.id"></span></a>
              <button @click="functions.copy_text(user.id)">
                <Icon.DocumentDuplicateIcon class="w-5 h-5 text-yellow-500"></Icon.DocumentDuplicateIcon>
              </button>
            </div>
          </td>
          <td class="border-grey-light border p-2">
            <div class="flex items-center">
              <a class="text-blue-500" href="###" @click="emit('userModal_open', index)"><span v-text="user.name"></span></a>
              <button @click="functions.copy_text(user.name)">
                <Icon.DocumentDuplicateIcon class="w-5 h-5 text-yellow-500"></Icon.DocumentDuplicateIcon>
              </button>
            </div>
          </td>
          <td class="border-grey-light border p-2"><span v-text="user.nick"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.gender"></span></td>
          <td class="border-grey-light border p-2 text-right"><span v-text="user.level"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.phone"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.email"></span></td>
          <td class="border-grey-light border p-1">
            <div class="sm:flex block justify-around mt-0.5">
              <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                      @click="emit('userModal_open', index)">
                <Icon.PencilSquareIcon class="h-5 w-5 text-white"></Icon.PencilSquareIcon>
                
              </button>
              <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                      @click="emit('user_delete', index)">
                <Icon.TrashIcon class="h-5 w-5 text-white"></Icon.TrashIcon>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  @import url("../assets/table.css");
</style>