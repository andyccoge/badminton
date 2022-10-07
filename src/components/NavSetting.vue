<!-- This example requires Tailwind CSS v2.0+ -->
<script setup>
    import { inject } from 'vue';
    import { db_sign_out } from '../firebase.js';
    import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
    import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline';
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

    const redirect = (url='') => {
        if(url){ location.href= url; }
    }
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
              <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="redirect('/pages/court_manage.html')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button class="rounded-2xl p-0.5 aspect-square border-2 bg-yellow-300 border-yellow-600" @click="db_sign_out">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
              <div class="hidden md:block" v-if="userNavigation.length>0 || show_notify">
                <div class="flex items-center">
                  <button type="button" v-if="show_notify"
                          class="rounded-full ml-2 p-1 focus:outline-none focus:ring-2
                              bg-yellow-600 text-yellow-400 hover:text-white focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
                    <span class="sr-only">View notifications</span>
                    <BellIcon class="h-4 w-4" aria-hidden="true" />
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
                  <Bars3Icon v-if="!open" class="block h-4 w-4" aria-hidden="true" />
                  <XMarkIcon v-else class="block h-4 w-4" aria-hidden="true" />
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
                <BellIcon class="h-4 w-4" aria-hidden="true" />
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
  </template>
  
  <style scoped>
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