<script setup>
  // import { ref, reactive, inject, provide} from 'vue';
  // import { useToast } from "vue-toastification";
  // import Firebase from '../components/Firebase.vue';
  // import ModalFirebase from '../components/ModalFirebase.vue';
  import * as functions from '../functions.js';
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
                <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              </button>
            </div>
          </td>
          <td class="border-grey-light border p-2">
            <div class="flex items-center">
              <a class="text-blue-500" href="###" @click="emit('userModal_open', index)"><span v-text="user.name"></span></a>
              <button @click="functions.copy_text(user.name)">
                <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
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
                <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                      @click="emit('user_delete', index)">
                <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
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