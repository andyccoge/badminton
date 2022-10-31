<!-- This example requires Tailwind CSS v2.0+ -->
<script setup>
  import { ref } from 'vue';
  import { db_sign_out } from '../firebase.js';
  import * as functions from '../functions.js';
  import Modal from '../components/Modal.vue';
  import * as Icon from '@heroicons/vue/24/outline';
  import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  const modal_open_question = ref(false); 
  const show_notify = false;
  const show_head_icon = false;
  const user = {
    name: '',
    email: '',
    imageUrl: '/src/assets/img/user.png',
  };
  const navigation = [
    { name: '人員列表', href: '/pages/setting_users.html', page:'setting_users', current: false },
    { name: '打球日管理', href: '/pages/setting_date.html', page:'setting_date', current: false },
    // { name: 'Projects', href: '#', page:'', current: false },
  ];
  const active_nav = location.href.split('/').pop().split('.')[0];
  for (let x = 0; x < navigation.length; x++) {
    if(navigation[x].page==active_nav){
      navigation[x].current = true; break;
    } 
  }
  const userNavigation = [
    // { name: 'Your Profile', href: '#' },
    // { name: 'Settings', href: '#' },
    // { name: 'Sign out', href: '#' },
  ];
</script>
  
<template>
  <div class="min-h-full">
    <Disclosure as="nav" class="bg-yellow-500" v-slot="{ open }">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-8 items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a href="/">
                <img class="h-6 w-6" src="/src/assets/img/favicon.ico" alt="羽球排場系統" />
              </a>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-yellow-600 text-white' : 'text-yellow-900 hover:bg-yellow-700 hover:text-white', 'px-3 py-1 rounded-md text-sm font-medium']" :aria-current="item.current ? 'page' : undefined">{{ item.name }}</a>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="modal_open_question=true">
              <Icon.QuestionMarkCircleIcon class="w-5 h-5"></Icon.QuestionMarkCircleIcon>
            </button>
            <!-- 
            <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="functions.window_open('/pages/court_manage.html')">
              <Icon.Squares2X2Icon class="w-5 h-5"></Icon.Squares2X2Icon>
            </button>
            -->
            <button class="rounded-2xl p-0.5 aspect-square border-2 bg-yellow-300 border-yellow-600" @click="db_sign_out()">
              <Icon.ArrowRightOnRectangleIcon class="w-5 h-5"></Icon.ArrowRightOnRectangleIcon>
            </button>
            <div class="hidden md:block" v-if="userNavigation.length>0 || show_notify">
              <div class="flex items-center">
                <button type="button" v-if="show_notify"
                        class="rounded-full ml-2 p-1 focus:outline-none focus:ring-2
                            bg-yellow-600 text-yellow-400 hover:text-white focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
                  <span class="sr-only">View notifications</span>
                  <Icon.BellIcon class="h-4 w-4" aria-hidden="true" />
                </button>
                <!-- Profile dropdown -->
                <Menu as="div" class="relative ml-3" v-if="userNavigation.length>0 || show_head_icon">
                  <div>
                    <MenuButton class="flex max-w-xs items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
                                      bg-yellow-600 text-sm focus:ring-white focus:ring-offset-yellow-600">
                      <span class="sr-only">Open user menu</span>
                      <img class="h-6 w-6 rounded-full" :src="user.imageUrl" :alt="user.name" v-if="show_head_icon"/>
                    </MenuButton>
                  </div>
                  <transition v-if="userNavigation.length>0"
                              enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                        <a :href="item.href" :class="[active ? 'bg-yellow-100' : '', 'block px-4 py-1 text-sm text-yellow-700']">{{ item.name }}</a>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
            <div class="ml-2 flex md:hidden" v-if="navigation.length>0 || show_head_icon">
              <!-- Mobile menu button -->
              <DisclosureButton class="inline-flex items-center justify-center rounded-md bg-yellow-600 p-1 text-yellow-400 hover:bg-yellow-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
                <span class="sr-only">Open main menu</span>
                <Icon.Bars3Icon v-if="!open" class="block h-4 w-4" aria-hidden="true" />
                <Icon.XMarkIcon v-else class="block h-4 w-4" aria-hidden="true" />
              </DisclosureButton>
            </div>
          </div>
        </div>
      </div>

      <DisclosurePanel class="md:hidden">
        <div class="space-y-1 px-2 pt-2 pb-3 sm:px-3" v-if="navigation.length>0">
          <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[item.current ? 'bg-yellow-700 text-white' : 'text-yellow-900 hover:bg-yellow-700 hover:text-white', 'block px-3 py-1 rounded-md text-base font-medium']" :aria-current="item.current ? 'page' : undefined">{{ item.name }}</DisclosureButton>
        </div>
        <div class="border-t border-yellow-700 pt-4 pb-3" v-if="show_head_icon">
          <div class="flex items-center px-5">
            <div class="flex-shrink-0">
              <img class="h-10 w-10 rounded-full" :src="user.imageUrl" alt="" />
            </div>
            <div class="ml-3">
              <div class="text-base font-medium leading-none text-white">{{ user.name }}</div>
              <div class="text-sm font-medium leading-none text-yellow-900">{{ user.email }}</div>
            </div>
            <button type="button" v-if="show_notify"
                    class="ml-auto flex-shrink-0 rounded-full bg-yellow-600 p-1 text-yellow-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
              <span class="sr-only">View notifications</span>
              <Icon.BellIcon class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-3 space-y-1 px-2" v-if="userNavigation.length>0">
            <DisclosureButton v-for="item in userNavigation" :key="item.name" as="a" :href="item.href" class="block rounded-md px-3 py-1 text-base font-medium text-yellow-900 hover:bg-yellow-700 hover:text-white">{{ item.name }}</DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
  <div class="nav_blank"></div>
  <!-- 操作說明 -->
  <modal :show="modal_open_question" :click_bg_close="true" @close="modal_open_question=false">
    <template #header>
      <h3 class="font-bold text-xl flex items-center">
        操作說明
      </h3>
    </template>
    <template #body>
      <div class="mb-2">
        先簡單說明一下基本流程：
        <ol>
          <li>後台管理>打球日管理 新增打球日。</li>
          <li>打球日新增完成後點ID的超連結或紫色小齒輪進入設定詳細內容。</li>
          <li>設定場地，可新增多個比賽場及預備場，比賽場可輸入名稱，例如：場地A。</li>
          <li>
            設定人員，有三種設法：
            <ul>
              <li>單一設定：選擇已往建立過的人員。</li>
              <li>單一新增：一個一個新增，可輸入性別、等級等資料。</li>
              <li>批次設定：以英文逗號(,)分隔姓名，系統會去比對過去名單，存在則套用，不存在則新增。</li>
            </ul>
          </li>
        </ol>
      </div>
      <div class="mb-2">
        以上都完成後就可點時間/地點 區塊，操作的第二顆按鈕(四個小正方形)，或回首頁點安排比賽(抓最新的打球日)開始進行場地的人員安排~
      </div>
      <div class="mb-2">
        補充人員建立說明：
        <ol>
          <li>「人員列表」的單一建立及「打球日詳細內容」內的人員設定都有重複的防呆。</li>
          <li>「人員列表」的批次新增「沒有」重複檢查，使用時需注意。</li>
          <li>批次建立/設定雖然只能輸入人名，但可後續再編輯詳細內容。</li>
          <li>使用批次設定要盡量確保名字都用一樣的，這樣系統才能找到以前建過的人員。</li>
        </ol>
      </div>
    </template>
    <template #footer>
      <div></div>
    </template>
  </modal>
</template>
  
<style scoped>
  ol{
    list-style: auto;
  }
  ul{
    list-style: disc;
  }
  ol,ul{
    padding: revert;
  }
  nav{
      width: 100%;
      top: 0;
      position: fixed;
      z-index: 15;
  }
  .nav_blank{
    padding-top: var(--nav_h);
  }
</style>