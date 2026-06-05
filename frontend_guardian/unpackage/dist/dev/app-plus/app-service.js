if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_LOAD = "onLoad";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const BASE_URL = "http://10.200.194.47:8080/api";
  formatAppLog("log", "at utils/request.ts:3", "API Base URL:", BASE_URL);
  const request = (options) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync("token");
      const header = {
        "Content-Type": "application/json",
        ...options.header
      };
      if (token) {
        header["Authorization"] = "Bearer " + token;
      }
      uni.request({
        url: BASE_URL + options.url,
        method: options.method || "GET",
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            uni.removeStorageSync("token");
            uni.removeStorageSync("user");
            uni.reLaunch({ url: "/pages/login/index" });
            reject(new Error("Unauthorized"));
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
        },
        fail: (err) => {
          formatAppLog("error", "at utils/request.ts:42", "Request failed:", err);
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          reject(err);
        }
      });
    });
  };
  const get = (url, data) => request({ url, method: "GET", data });
  const post = (url, data) => request({ url, method: "POST", data });
  const put = (url, data) => request({ url, method: "PUT", data });
  const del = (url, data) => request({ url, method: "DELETE", data });
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const user = vue.ref(null);
      const bindElderlyList = vue.ref([]);
      const selectedElderly = vue.ref(null);
      const latestHealthData = vue.ref(null);
      const currentDate = vue.computed(() => {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const weekDay = weekDays[now.getDay()];
        return `${year}年${month}月${day}日 ${weekDay}`;
      });
      const loadUser = () => {
        const userStr = uni.getStorageSync("user");
        if (userStr) {
          user.value = JSON.parse(userStr);
        }
      };
      const loadBindings = async () => {
        var _a;
        if (!((_a = user.value) == null ? void 0 : _a.userId))
          return;
        try {
          const result = await get(`/binding/guardian/list`);
          if (result.code === 200 && result.data) {
            bindElderlyList.value = result.data;
            if (bindElderlyList.value.length > 0 && !selectedElderly.value) {
              selectedElderly.value = bindElderlyList.value[0];
              loadHealthData();
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:163", "Load bindings failed:", error);
        }
      };
      const loadHealthData = async () => {
        var _a;
        if (!((_a = selectedElderly.value) == null ? void 0 : _a.elderlyId))
          return;
        try {
          const result = await get(`/health/elderly/${selectedElderly.value.elderlyId}/latest`);
          if (result.code === 200 && result.data) {
            latestHealthData.value = result.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:176", "Load health data failed:", error);
        }
      };
      const onElderlyChange = (e) => {
        const index = e.detail.value;
        selectedElderly.value = bindElderlyList.value[index];
        loadHealthData();
      };
      const goLocation = () => {
        if (!selectedElderly.value) {
          uni.showToast({ title: "请先选择老人", icon: "none" });
          return;
        }
        uni.navigateTo({ url: `/pages/location/index?elderlyId=${selectedElderly.value.elderlyId}` });
      };
      const goHistory = () => {
        if (!selectedElderly.value) {
          uni.showToast({ title: "请先选择老人", icon: "none" });
          return;
        }
        uni.navigateTo({ url: `/pages/location/history?elderlyId=${selectedElderly.value.elderlyId}&nickname=${encodeURIComponent(selectedElderly.value.nickname)}` });
      };
      const goHealth = () => {
        if (!selectedElderly.value) {
          uni.showToast({ title: "请先选择老人", icon: "none" });
          return;
        }
        uni.navigateTo({ url: `/pages/health/index?elderlyId=${selectedElderly.value.elderlyId}` });
      };
      const goAlarm = () => {
        uni.switchTab({ url: "/pages/alarm/index" });
      };
      const goBind = () => {
        uni.navigateTo({ url: "/pages/bind/index" });
      };
      const goFence = () => {
        uni.navigateTo({ url: "/pages/fence/index" });
      };
      vue.onMounted(() => {
        loadUser();
        loadBindings();
      });
      onShow(() => {
        loadUser();
        loadBindings();
      });
      const __returned__ = { user, bindElderlyList, selectedElderly, latestHealthData, currentDate, loadUser, loadBindings, loadHealthData, onElderlyChange, goLocation, goHistory, goHealth, goAlarm, goBind, goFence };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b;
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("view", { class: "avatar" }, [
            vue.createElementVNode("text", { class: "avatar-icon" }, "👤")
          ]),
          vue.createElementVNode("view", { class: "user-text" }, [
            vue.createElementVNode(
              "text",
              { class: "greeting" },
              "您好，" + vue.toDisplayString(((_a = $setup.user) == null ? void 0 : _a.nickname) || "监护人"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "date" },
              vue.toDisplayString($setup.currentDate),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      $setup.bindElderlyList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "elderly-selector"
      }, [
        vue.createElementVNode("text", { class: "selector-label" }, "当前查看："),
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.bindElderlyList,
          "range-key": "elderlyName",
          onChange: $setup.onElderlyChange
        }, [
          vue.createElementVNode("view", { class: "picker-btn" }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString(((_b = $setup.selectedElderly) == null ? void 0 : _b.elderlyName) || "请选择老人"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
          ])
        ], 40, ["range"])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.bindElderlyList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "👴"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无绑定老人"),
        vue.createElementVNode("button", {
          class: "bind-btn",
          onClick: $setup.goBind
        }, "添加绑定")
      ])) : vue.createCommentVNode("v-if", true),
      $setup.selectedElderly && $setup.latestHealthData ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "health-section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode(
            "text",
            { class: "section-title" },
            vue.toDisplayString($setup.selectedElderly.elderlyName) + "的健康数据",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "health-card" }, [
          vue.createElementVNode("view", { class: "health-item" }, [
            vue.createElementVNode("view", { class: "health-icon-box heart" }, "🫀"),
            vue.createElementVNode("view", { class: "health-info" }, [
              vue.createElementVNode("text", { class: "health-value" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.latestHealthData.heartRate ?? "--"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "unit" }, "bpm")
              ]),
              vue.createElementVNode("text", { class: "health-label" }, "心率")
            ])
          ]),
          vue.createElementVNode("view", { class: "health-item" }, [
            vue.createElementVNode("view", { class: "health-icon-box pressure" }, "💉"),
            vue.createElementVNode("view", { class: "health-info" }, [
              vue.createElementVNode("text", { class: "health-value" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.latestHealthData.systolicPressure ?? "--") + "/" + vue.toDisplayString($setup.latestHealthData.diastolicPressure ?? "--"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "unit" }, "mmHg")
              ]),
              vue.createElementVNode("text", { class: "health-label" }, "血压")
            ])
          ]),
          vue.createElementVNode("view", { class: "health-item" }, [
            vue.createElementVNode("view", { class: "health-icon-box temp" }, "🌡️"),
            vue.createElementVNode("view", { class: "health-info" }, [
              vue.createElementVNode("text", { class: "health-value" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.latestHealthData.temperature ?? "--"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "unit" }, "℃")
              ]),
              vue.createElementVNode("text", { class: "health-label" }, "体温")
            ])
          ]),
          vue.createElementVNode("view", { class: "health-item" }, [
            vue.createElementVNode("view", { class: "health-icon-box steps" }, "👟"),
            vue.createElementVNode("view", { class: "health-info" }, [
              vue.createElementVNode("text", { class: "health-value" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.latestHealthData.steps ?? "--"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "unit" }, "步")
              ]),
              vue.createElementVNode("text", { class: "health-label" }, "步数")
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "quick-actions" }, [
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goLocation
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "📍"),
          vue.createElementVNode("text", { class: "action-text" }, "实时位置")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goHistory
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "📜"),
          vue.createElementVNode("text", { class: "action-text" }, "历史轨迹")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goFence
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "🏠"),
          vue.createElementVNode("text", { class: "action-text" }, "电子围栏")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goHealth
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "📊"),
          vue.createElementVNode("text", { class: "action-text" }, "健康详情")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goAlarm
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "🔔"),
          vue.createElementVNode("text", { class: "action-text" }, "告警记录")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: $setup.goBind
        }, [
          vue.createElementVNode("text", { class: "action-icon" }, "🔗"),
          vue.createElementVNode("text", { class: "action-text" }, "绑定管理")
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/index/index.vue"]]);
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.ref({
        phone: "",
        password: ""
      });
      const handleLogin = async () => {
        if (!form.value.phone || !form.value.password) {
          uni.showToast({ title: "请输入手机号密码", icon: "none" });
          return;
        }
        try {
          const res = await post("/auth/login", { ...form.value, clientType: "guardian" }, false);
          if (res.code === 200) {
            uni.setStorageSync("token", res.data.token);
            uni.setStorageSync("user", JSON.stringify(res.data));
            uni.setStorageSync("isElderlyUser", "false");
            uni.switchTab({ url: "/pages/index/index" });
          } else {
            uni.showToast({ title: res.message || "登录失败", icon: "none" });
          }
        } catch (error) {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        }
      };
      const goToRegister = () => {
        uni.navigateTo({ url: "/pages/register/index" });
      };
      const __returned__ = { form, handleLogin, goToRegister };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-header" }, [
        vue.createElementVNode("text", { class: "title" }, "监护端"),
        vue.createElementVNode("text", { class: "subtitle" }, "守护家人 关爱健康")
      ]),
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.phone = $event),
              type: "text",
              placeholder: "请输入手机号",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.password = $event),
              type: "password",
              placeholder: "请输入密码",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.password]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          onClick: $setup.handleLogin
        }, "登 录"),
        vue.createElementVNode("view", { class: "register-link" }, [
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.goToRegister
          }, "没有账号？立即注册")
        ])
      ])
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-d08ef7d4"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/login/index.vue"]]);
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.ref({
        username: "",
        phone: "",
        nickname: "",
        password: "",
        confirmPassword: ""
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const goToLogin = () => {
        uni.navigateTo({ url: "/pages/login/index" });
      };
      const handleRegister = async () => {
        if (!form.value.username) {
          uni.showToast({ title: "请输入用户名", icon: "none" });
          return;
        }
        if (!form.value.phone) {
          uni.showToast({ title: "请输入手机号", icon: "none" });
          return;
        }
        if (!form.value.nickname) {
          uni.showToast({ title: "请输入昵称", icon: "none" });
          return;
        }
        if (!form.value.password) {
          uni.showToast({ title: "请输入密码", icon: "none" });
          return;
        }
        if (form.value.password !== form.value.confirmPassword) {
          uni.showToast({ title: "两次密码输入不一致", icon: "none" });
          return;
        }
        try {
          const res = await post("/auth/register", {
            username: form.value.username,
            phone: form.value.phone,
            nickname: form.value.nickname,
            password: form.value.password,
            userType: "guardian",
            captchaKey: "",
            captchaCode: ""
          }, false);
          if (res.code === 200) {
            uni.showToast({ title: "注册成功", icon: "success" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/index" });
            }, 1500);
          } else {
            uni.showToast({ title: res.message || "注册失败", icon: "none" });
          }
        } catch (error) {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        }
      };
      const __returned__ = { form, goBack, goToLogin, handleRegister };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "register-header" }, [
        vue.createElementVNode("text", {
          class: "back-btn",
          onClick: $setup.goBack
        }, "‹"),
        vue.createElementVNode("text", { class: "title" }, "注册")
      ]),
      vue.createElementVNode("view", { class: "register-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.username = $event),
              type: "text",
              placeholder: "请输入用户名",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.phone = $event),
              type: "text",
              placeholder: "请输入手机号",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.nickname = $event),
              type: "text",
              placeholder: "请输入昵称",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.nickname]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.password = $event),
              type: "password",
              placeholder: "请输入密码",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.password]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.confirmPassword = $event),
              type: "password",
              placeholder: "请确认密码",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.confirmPassword]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "register-btn",
          onClick: $setup.handleRegister
        }, "注 册"),
        vue.createElementVNode("view", { class: "login-link" }, [
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.goToLogin
          }, "已有账号？立即登录")
        ])
      ])
    ]);
  }
  const PagesRegisterIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-46a64346"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/register/index.vue"]]);
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const elderlyId = vue.ref(null);
      const elderlyInfo = vue.ref(null);
      const activeTab = vue.ref("heart");
      const heartRateList = vue.ref([]);
      const pressureList = vue.ref([]);
      const stepsList = vue.ref([]);
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const date = new Date(timeStr.replace("T", " "));
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      };
      const formatDate = (timeStr) => {
        if (!timeStr)
          return "";
        const date = new Date(timeStr.replace("T", " "));
        return `${date.getMonth() + 1}/${date.getDate()}`;
      };
      const loadHealthData = async () => {
        if (!elderlyId.value)
          return;
        try {
          const result = await get(`/health/elderly/${elderlyId.value}/history`);
          if (result.code === 200 && result.data) {
            const data = result.data;
            heartRateList.value = data.filter((item) => item.heartRate !== null);
            pressureList.value = data.filter((item) => item.systolicPressure !== null);
            stepsList.value = data.filter((item) => item.steps !== null);
          }
        } catch (error) {
          formatAppLog("error", "at pages/health/index.vue:122", "Load health data failed:", error);
        }
      };
      const goBack = () => {
        uni.navigateBack();
      };
      onLoad((options) => {
        if (options.elderlyId) {
          elderlyId.value = parseInt(options.elderlyId);
          elderlyInfo.value = {
            elderlyId: elderlyId.value,
            nickname: options.nickname || "老人"
          };
          loadHealthData();
        }
      });
      vue.onMounted(() => {
        if (!elderlyId.value) {
          const bindElderlyStr = uni.getStorageSync("selectedElderly");
          if (bindElderlyStr) {
            elderlyInfo.value = JSON.parse(bindElderlyStr);
            elderlyId.value = elderlyInfo.value.elderlyId;
            loadHealthData();
          }
        }
      });
      const __returned__ = { elderlyId, elderlyInfo, activeTab, heartRateList, pressureList, stepsList, formatTime, formatDate, loadHealthData, goBack };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "health-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("text", {
            class: "back-btn",
            onClick: $setup.goBack
          }, "‹"),
          vue.createElementVNode("text", { class: "title" }, "健康数据")
        ]),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString(((_a = $setup.elderlyInfo) == null ? void 0 : _a.nickname) || "老人") + "的健康记录",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "heart" }]),
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.activeTab = "heart")
          },
          " 心率 ",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "pressure" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.activeTab = "pressure")
          },
          " 血压 ",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "steps" }]),
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.activeTab = "steps")
          },
          " 步数 ",
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "content-area" }, [
        $setup.activeTab === "heart" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "chart-placeholder"
        }, [
          vue.createElementVNode("text", { class: "chart-icon" }, "🫀"),
          vue.createElementVNode("text", { class: "chart-title" }, "心率趋势"),
          vue.createElementVNode("view", { class: "data-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.heartRateList, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "data-item",
                  key: item.id
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "data-time" },
                    vue.toDisplayString($setup.formatTime(item.recordTime)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "data-value" },
                    vue.toDisplayString(item.heartRate) + " bpm",
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.activeTab === "pressure" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "chart-placeholder"
        }, [
          vue.createElementVNode("text", { class: "chart-icon" }, "💉"),
          vue.createElementVNode("text", { class: "chart-title" }, "血压趋势"),
          vue.createElementVNode("view", { class: "data-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.pressureList, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "data-item",
                  key: item.id
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "data-time" },
                    vue.toDisplayString($setup.formatTime(item.recordTime)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "data-value" },
                    vue.toDisplayString(item.systolicPressure) + "/" + vue.toDisplayString(item.diastolicPressure) + " mmHg",
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.activeTab === "steps" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "chart-placeholder"
        }, [
          vue.createElementVNode("text", { class: "chart-icon" }, "👟"),
          vue.createElementVNode("text", { class: "chart-title" }, "步数统计"),
          vue.createElementVNode("view", { class: "data-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.stepsList, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "data-item",
                  key: item.id
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "data-time" },
                    vue.toDisplayString($setup.formatDate(item.recordTime)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "data-value" },
                    vue.toDisplayString(item.steps) + " 步",
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesHealthIndex = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-36fa64d0"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/health/index.vue"]]);
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const elderlyId = vue.ref(null);
      const elderlyInfo = vue.ref(null);
      const currentLocation = vue.ref({
        latitude: 39.90469,
        longitude: 116.40717,
        updateTime: ""
      });
      const fences = vue.ref([]);
      const mapReady = vue.ref(false);
      const webViewContext = vue.ref(null);
      const mapKey = vue.ref(0);
      const mapUrl = vue.computed(() => {
        var _a;
        const lng = currentLocation.value.longitude;
        const lat = currentLocation.value.latitude;
        const nickname = ((_a = elderlyInfo.value) == null ? void 0 : _a.nickname) || "老人";
        if (lng && lat) {
          return `/static/tianditu.html?lng=${lng}&lat=${lat}&title=${encodeURIComponent(nickname)}`;
        }
        return "/static/tianditu.html";
      });
      const activeFence = vue.computed(() => {
        return fences.value.find((f) => f.enabled === 1);
      });
      const locationText = vue.computed(() => {
        if (!currentLocation.value.latitude)
          return "加载中...";
        return currentLocation.value.address || `${currentLocation.value.latitude.toFixed(6)}, ${currentLocation.value.longitude.toFixed(6)}`;
      });
      const updateTime = vue.computed(() => {
        if (!currentLocation.value.updateTime)
          return "未知";
        const date = new Date(currentLocation.value.updateTime.replace("T", " "));
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const onMapMessage = (e) => {
        const data = e.detail.data[0];
        if (data && data.type === "mapReady") {
          formatAppLog("log", "at pages/location/index.vue:134", "Map ready, hasLocation:", data.hasLocation);
        }
      };
      const updateMapMarker = () => {
      };
      const loadLocation = async () => {
        if (!elderlyId.value)
          return;
        try {
          const result = await get(`/location/elderly/${elderlyId.value}`);
          if (result.code === 200 && result.data) {
            currentLocation.value = {
              latitude: result.data.latitude || 39.90469,
              longitude: result.data.longitude || 116.40717,
              updateTime: result.data.updateTime || (/* @__PURE__ */ new Date()).toISOString(),
              address: result.data.address
            };
            updateMapMarker();
          }
        } catch (error) {
          formatAppLog("error", "at pages/location/index.vue:157", "Load location failed:", error);
          currentLocation.value.updateTime = (/* @__PURE__ */ new Date()).toISOString();
        }
      };
      const loadFences = async () => {
        if (!elderlyId.value)
          return;
        try {
          const result = await get(`/fence/elderly/${elderlyId.value}`);
          if (result.code === 200 && result.data) {
            fences.value = result.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/location/index.vue:171", "Load fences failed:", error);
        }
      };
      const refreshLocation = () => {
        loadLocation();
        loadFences();
        uni.showToast({ title: "位置已刷新", icon: "success" });
      };
      const viewHistory = () => {
        var _a;
        if (!elderlyId.value) {
          uni.showToast({ title: "请先选择老人", icon: "none" });
          return;
        }
        uni.navigateTo({
          url: `/pages/location/history?elderlyId=${elderlyId.value}&nickname=${((_a = elderlyInfo.value) == null ? void 0 : _a.nickname) || ""}`
        });
      };
      const goToFence = () => {
        uni.navigateTo({ url: "/pages/fence/index" });
      };
      onLoad((options) => {
        if (options.elderlyId) {
          elderlyId.value = parseInt(options.elderlyId);
          elderlyInfo.value = {
            elderlyId: elderlyId.value,
            nickname: options.nickname || "老人"
          };
        }
      });
      vue.onMounted(() => {
        if (!elderlyId.value) {
          const bindElderlyStr = uni.getStorageSync("selectedElderly");
          if (bindElderlyStr) {
            elderlyInfo.value = JSON.parse(bindElderlyStr);
            elderlyId.value = elderlyInfo.value.elderlyId;
          }
        }
        loadLocation();
        loadFences();
        vue.nextTick(() => {
          webViewContext.value = uni.createWebViewContext("locationWebView");
        });
      });
      vue.watch(currentLocation, () => {
        mapKey.value++;
      }, { deep: true });
      const __returned__ = { elderlyId, elderlyInfo, currentLocation, fences, mapReady, webViewContext, mapKey, mapUrl, activeFence, locationText, updateTime, goBack, onMapMessage, updateMapMarker, loadLocation, loadFences, refreshLocation, viewHistory, goToFence };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "location-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("text", {
            class: "back-btn",
            onClick: $setup.goBack
          }, "‹"),
          vue.createElementVNode("text", { class: "title" }, "实时位置")
        ]),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString(((_a = $setup.elderlyInfo) == null ? void 0 : _a.nickname) || "老人") + "的位置信息",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "map-area" }, [
        (vue.openBlock(), vue.createElementBlock("web-view", {
          id: "locationWebView",
          src: $setup.mapUrl,
          key: $setup.mapKey,
          onMessage: $setup.onMapMessage,
          style: { width: "100%", height: "100%" }
        }, null, 40, ["src"]))
      ]),
      $setup.activeFence ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "fence-status"
      }, [
        vue.createElementVNode("view", { class: "fence-icon" }, "🏠"),
        vue.createElementVNode("view", { class: "fence-info" }, [
          vue.createElementVNode(
            "text",
            { class: "fence-name" },
            vue.toDisplayString($setup.activeFence.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "fence-desc" },
            "半径 " + vue.toDisplayString($setup.activeFence.radius) + " 米",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", {
          class: "fence-action",
          onClick: $setup.goToFence
        }, [
          vue.createElementVNode("text", { class: "action-text" }, "管理")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "location-info" }, [
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "info-icon" }, "📍"),
          vue.createElementVNode("view", { class: "info-content" }, [
            vue.createElementVNode("text", { class: "info-label" }, "当前位置"),
            vue.createElementVNode(
              "text",
              { class: "info-text" },
              vue.toDisplayString($setup.locationText),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "info-icon" }, "🕐"),
          vue.createElementVNode("view", { class: "info-content" }, [
            vue.createElementVNode("text", { class: "info-label" }, "更新时间"),
            vue.createElementVNode(
              "text",
              { class: "info-text" },
              vue.toDisplayString($setup.updateTime),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "action-buttons" }, [
        vue.createElementVNode("button", {
          class: "refresh-btn",
          onClick: $setup.refreshLocation
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "🔄"),
          vue.createElementVNode("text", { class: "btn-text" }, "刷新位置")
        ]),
        vue.createElementVNode("button", {
          class: "history-btn",
          onClick: $setup.viewHistory
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "📜"),
          vue.createElementVNode("text", { class: "btn-text" }, "历史轨迹")
        ])
      ])
    ]);
  }
  const PagesLocationIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-22eb4282"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/location/index.vue"]]);
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "history",
    setup(__props, { expose: __expose }) {
      __expose();
      const elderlyId = vue.ref(null);
      const elderlyInfo = vue.ref(null);
      const selectedDate = vue.ref("today");
      const locationList = vue.ref([]);
      const webview = vue.ref(null);
      let webviewReady = false;
      const mapKey = vue.ref(0);
      const dateOptions = [
        { label: "今天", value: "today" },
        { label: "昨天", value: "yesterday" },
        { label: "近7天", value: "week" }
      ];
      const totalPoints = vue.computed(() => locationList.value.length);
      const distance = vue.computed(() => {
        if (locationList.value.length < 2)
          return "0";
        let total = 0;
        for (let i = 1; i < locationList.value.length; i++) {
          const prev = locationList.value[i - 1];
          const curr = locationList.value[i];
          total += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        }
        return (total / 1e3).toFixed(2);
      });
      const duration = vue.computed(() => {
        if (locationList.value.length < 2)
          return "0分钟";
        const first = new Date(locationList.value[0].updateTime.replace("T", " "));
        const last = new Date(locationList.value[locationList.value.length - 1].updateTime.replace("T", " "));
        const diff = Math.floor((last.getTime() - first.getTime()) / 1e3 / 60);
        if (diff < 60)
          return `${diff}分钟`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}小时${mins}分钟`;
      });
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const date = new Date(timeStr.replace("T", " "));
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const onWebviewLoad = () => {
        formatAppLog("log", "at pages/location/history.vue:154", "Webview loaded");
      };
      const onWebviewMessage = (e) => {
        const data = e.detail.data[0];
        if (data && data.type === "mapReady") {
          webviewReady = true;
          loadHistory();
        }
      };
      const selectDate = (date) => {
        selectedDate.value = date;
        loadHistory();
      };
      const loadHistory = async () => {
        if (!elderlyId.value)
          return;
        try {
          uni.showLoading({ title: "加载中..." });
          let url = "";
          if (selectedDate.value === "today") {
            url = `/location/elderly/${elderlyId.value}/today`;
          } else {
            url = `/location/elderly/${elderlyId.value}/history`;
          }
          const result = await get(url);
          if (result.code === 200 && result.data) {
            locationList.value = result.data;
            mapKey.value++;
          } else {
            locationList.value = [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/location/history.vue:191", "Load history failed:", error);
          locationList.value = [];
        } finally {
          uni.hideLoading();
        }
      };
      const trackUrl = vue.computed(() => {
        if (locationList.value.length === 0) {
          return "/static/tianditu.html";
        }
        const points = locationList.value.map((loc) => ({
          lat: loc.latitude,
          lng: loc.longitude
        }));
        return `/static/tianditu.html?track=${encodeURIComponent(JSON.stringify(points))}`;
      });
      onLoad((options) => {
        if (options.elderlyId) {
          elderlyId.value = parseInt(options.elderlyId);
        }
        if (options.nickname) {
          elderlyInfo.value = {
            elderlyId: elderlyId.value,
            nickname: options.nickname
          };
        }
      });
      vue.onMounted(() => {
        if (!elderlyId.value) {
          const bindElderlyStr = uni.getStorageSync("selectedElderly");
          if (bindElderlyStr) {
            elderlyInfo.value = JSON.parse(bindElderlyStr);
            elderlyId.value = elderlyInfo.value.elderlyId;
          }
        }
      });
      const __returned__ = { elderlyId, elderlyInfo, selectedDate, locationList, webview, get webviewReady() {
        return webviewReady;
      }, set webviewReady(v) {
        webviewReady = v;
      }, mapKey, dateOptions, totalPoints, distance, duration, calculateDistance, formatTime, goBack, onWebviewLoad, onWebviewMessage, selectDate, loadHistory, trackUrl };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "history-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("text", {
            class: "back-btn",
            onClick: $setup.goBack
          }, "‹"),
          vue.createElementVNode("text", { class: "title" }, "历史轨迹")
        ]),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString(((_a = $setup.elderlyInfo) == null ? void 0 : _a.nickname) || "老人") + "的活动轨迹",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "date-selector" }, [
        vue.createElementVNode("view", { class: "date-tabs" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.dateOptions, (date) => {
              return vue.createElementVNode("view", {
                key: date.value,
                class: vue.normalizeClass(["date-tab", { active: $setup.selectedDate === date.value }]),
                onClick: ($event) => $setup.selectDate(date.value)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(date.label),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "map-area" }, [
        (vue.openBlock(), vue.createElementBlock("web-view", {
          ref: "webview",
          src: $setup.trackUrl,
          key: $setup.mapKey,
          onMessage: $setup.onWebviewMessage,
          onLoad: $setup.onWebviewLoad
        }, null, 40, ["src"]))
      ]),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.totalPoints),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "记录点数")
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.distance) + "km",
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "移动距离")
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.duration),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "活动时长")
        ])
      ]),
      vue.createElementVNode("view", { class: "location-list" }, [
        vue.createElementVNode("view", { class: "list-header" }, [
          vue.createElementVNode("text", { class: "list-title" }, "位置记录"),
          vue.createElementVNode(
            "text",
            { class: "list-count" },
            vue.toDisplayString($setup.locationList.length) + "条",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "list-body"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.locationList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "list-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "item-time" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "time-text" },
                    vue.toDisplayString($setup.formatTime(item.updateTime)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "item-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "item-address" },
                    vue.toDisplayString(item.address || "未知位置"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "item-coord" },
                    vue.toDisplayString(item.latitude.toFixed(6)) + ", " + vue.toDisplayString(item.longitude.toFixed(6)),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $setup.locationList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-list"
          }, [
            vue.createElementVNode("text", null, "暂无位置记录")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesLocationHistory = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-24b8dbe8"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/location/history.vue"]]);
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const alarmList = vue.ref([]);
      const previousAlarmIds = vue.ref(/* @__PURE__ */ new Set());
      const getAlarmIcon = (type) => {
        const icons = {
          sos: "🆘",
          fall: "⚠️",
          heartRate: "🫀",
          battery: "🔋",
          fence: "📍"
        };
        return icons[type] || "🔔";
      };
      const getAlarmTitle = (type) => {
        const titles = {
          sos: "紧急求助",
          fall: "跌倒提醒",
          heartRate: "心率异常",
          battery: "设备低电量",
          fence: "越界提醒"
        };
        return titles[type] || "告警通知";
      };
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const date = new Date(timeStr.replace("T", " "));
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      };
      const playAlarmSound = () => {
        uni.vibrateLong({
          success: () => {
            formatAppLog("log", "at pages/alarm/index.vue:93", "震动成功");
          },
          fail: () => {
            formatAppLog("log", "at pages/alarm/index.vue:96", "震动失败");
          }
        });
      };
      const showAlarmNotification = (alarm) => {
        const title = getAlarmTitle(alarm.type);
        const content = `${alarm.elderlyName} - ${alarm.content}`;
        uni.createPushMessage({
          title,
          content,
          badge: 1,
          success: () => {
            formatAppLog("log", "at pages/alarm/index.vue:111", "通知已发送到通知栏");
          },
          fail: () => {
            formatAppLog("log", "at pages/alarm/index.vue:114", "通知发送失败");
          }
        });
        uni.showModal({
          title: "🆘 " + title,
          content,
          showCancel: false,
          confirmText: "知道了",
          confirmColor: "#ff4d4f",
          success: () => {
            formatAppLog("log", "at pages/alarm/index.vue:126", "用户已确认告警");
          }
        });
      };
      const checkNewAlarms = (newAlarms) => {
        const newAlarmIds = new Set(newAlarms.map((a) => a.id));
        newAlarms.forEach((alarm) => {
          if (!previousAlarmIds.value.has(alarm.id) && alarm.status === "pending") {
            playAlarmSound();
            if (alarm.type === "sos") {
              showAlarmNotification(alarm);
            }
          }
        });
        previousAlarmIds.value = newAlarmIds;
      };
      const handleAlarm = async (alarm) => {
        uni.showModal({
          title: "确认处理",
          content: `确定要处理这条告警吗？`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await put(`/alarm/${alarm.id}/handle`);
                if (result.code === 200) {
                  uni.showToast({ title: "处理成功", icon: "success" });
                  loadAlarms();
                } else {
                  uni.showToast({ title: result.message || "处理失败", icon: "none" });
                }
              } catch (error) {
                uni.showToast({ title: "处理失败", icon: "none" });
              }
            }
          }
        });
      };
      const loadAlarms = async () => {
        const userStr = uni.getStorageSync("user");
        if (!userStr)
          return;
        const user = JSON.parse(userStr);
        try {
          const result = await get(`/alarm/guardian/${user.userId}`);
          if (result.code === 200 && result.data) {
            const newAlarms = result.data.map((item) => ({
              id: item.id,
              type: item.alarmType,
              content: item.content,
              elderlyName: item.elderlyName || "老人",
              createTime: item.createTime,
              status: item.status
            }));
            checkNewAlarms(newAlarms);
            alarmList.value = newAlarms;
          }
        } catch (error) {
          formatAppLog("error", "at pages/alarm/index.vue:191", "Load alarms failed:", error);
          alarmList.value = [
            { id: 1, type: "sos", content: "老人触发了紧急求助", elderlyName: "张奶奶", createTime: (/* @__PURE__ */ new Date()).toISOString(), status: "pending" },
            { id: 2, type: "heartRate", content: "心率异常：120 bpm", elderlyName: "张奶奶", createTime: new Date(Date.now() - 36e5).toISOString(), status: "handled" }
          ];
        }
      };
      vue.onMounted(() => {
        loadAlarms();
        setInterval(() => {
          loadAlarms();
        }, 1e4);
      });
      onShow(() => {
        loadAlarms();
      });
      const __returned__ = { alarmList, previousAlarmIds, getAlarmIcon, getAlarmTitle, formatTime, playAlarmSound, showAlarmNotification, checkNewAlarms, handleAlarm, loadAlarms };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "alarm-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "告警记录")
      ]),
      $setup.alarmList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "alarm-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.alarmList, (item) => {
            return vue.openBlock(), vue.createElementBlock(
              "view",
              {
                class: vue.normalizeClass(["alarm-item", item.type]),
                key: item.id
              },
              [
                vue.createElementVNode("view", { class: "alarm-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "alarm-icon" },
                    vue.toDisplayString($setup.getAlarmIcon(item.type)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "alarm-title" },
                    vue.toDisplayString($setup.getAlarmTitle(item.type)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "alarm-time" },
                    vue.toDisplayString($setup.formatTime(item.createTime)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "alarm-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "alarm-text" },
                    vue.toDisplayString(item.content),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "alarm-elderly" },
                    "老人：" + vue.toDisplayString(item.elderlyName),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "alarm-footer" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["alarm-status", { handled: item.status === "handled" }])
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(item.status === "handled" ? "已处理" : "待处理"),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  item.status !== "handled" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "handle-btn",
                    onClick: ($event) => $setup.handleAlarm(item)
                  }, [
                    vue.createElementVNode("text", null, "处理")
                  ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ])
              ],
              2
              /* CLASS */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "🔔"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无告警记录")
      ]))
    ]);
  }
  const PagesAlarmIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-740bffd5"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/alarm/index.vue"]]);
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const bindList = vue.ref([]);
      const phone = vue.ref("");
      const goBack = () => {
        uni.navigateBack();
      };
      const loadBindings = async () => {
        const userStr = uni.getStorageSync("user");
        if (!userStr)
          return;
        JSON.parse(userStr);
        try {
          const result = await get(`/binding/guardian/list`);
          if (result.code === 200 && result.data) {
            bindList.value = result.data.map((item) => ({
              id: item.id,
              elderlyId: item.elderlyId,
              elderlyName: item.elderlyName || item.nickname || "老人",
              status: item.status === 1 ? "active" : "pending"
            }));
          }
        } catch (error) {
          formatAppLog("error", "at pages/bind/index.vue:92", "Load bindings failed:", error);
        }
      };
      const unbind = (item) => {
        uni.showModal({
          title: "确认解除",
          content: `确认要解除与 ${item.elderlyName} 的绑定吗？`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await del(`/binding/${item.id}`);
                if (result.code === 200) {
                  uni.showToast({ title: "已解除绑定", icon: "success" });
                  loadBindings();
                }
              } catch (error) {
                uni.showToast({ title: "解除失败", icon: "none" });
              }
            }
          }
        });
      };
      const addBind = async () => {
        if (!phone.value) {
          uni.showToast({ title: "请输入老人手机号", icon: "none" });
          return;
        }
        const userStr = uni.getStorageSync("user");
        if (!userStr)
          return;
        const user = JSON.parse(userStr);
        try {
          const result = await post("/binding/request", {
            guardianId: user.userId,
            phone: phone.value
          });
          if (result.code === 200) {
            uni.showToast({ title: "绑定请求已发送，等待老人确认", icon: "success" });
            phone.value = "";
            loadBindings();
          } else {
            uni.showToast({ title: result.message || "绑定失败", icon: "none" });
          }
        } catch (error) {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        }
      };
      vue.onMounted(() => {
        loadBindings();
      });
      onShow(() => {
        loadBindings();
      });
      const __returned__ = { bindList, phone, goBack, loadBindings, unbind, addBind };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "bind-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("text", {
            class: "back-btn",
            onClick: $setup.goBack
          }, "‹"),
          vue.createElementVNode("text", { class: "title" }, "绑定管理")
        ]),
        vue.createElementVNode("text", { class: "subtitle" }, "管理您的监护绑定关系")
      ]),
      $setup.bindList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "bind-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.bindList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "bind-item",
              key: item.id
            }, [
              vue.createElementVNode("view", { class: "bind-avatar" }, [
                vue.createElementVNode("text", { class: "avatar-icon" }, "👴")
              ]),
              vue.createElementVNode("view", { class: "bind-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "bind-name" },
                  vue.toDisplayString(item.elderlyName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["bind-status", { active: item.status === "active", pending: item.status === "pending" }])
                  },
                  vue.toDisplayString(item.status === "active" ? "已绑定" : "待确认"),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "bind-actions" }, [
                vue.createElementVNode("button", {
                  class: "unbind-btn",
                  onClick: ($event) => $setup.unbind(item)
                }, "解除", 8, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "🔗"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无绑定关系")
      ])),
      vue.createElementVNode("view", { class: "add-section" }, [
        vue.createElementVNode("view", { class: "add-header" }, [
          vue.createElementVNode("text", { class: "add-title" }, "添加新绑定")
        ]),
        vue.createElementVNode("view", { class: "add-form" }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.phone = $event),
                type: "text",
                placeholder: "请输入老人手机号",
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.phone]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "add-btn",
            onClick: $setup.addBind
          }, "添加绑定")
        ])
      ])
    ]);
  }
  const PagesBindIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-c06d484e"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/bind/index.vue"]]);
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const selectedIndex = vue.ref(0);
      const fenceStatus = vue.ref("inactive");
      const fenceRadius = vue.ref(500);
      const notifications = vue.ref(true);
      const fenceId = vue.ref(null);
      const centerAddress = vue.ref("望京SOHO");
      const elderlyOptions = vue.ref([]);
      const history = vue.ref([]);
      const goBack = () => {
        uni.navigateBack();
      };
      const onElderlyChange = async (e) => {
        selectedIndex.value = e.detail.value;
        await loadFence();
      };
      const loadElderlyList = async () => {
        try {
          const userStr = uni.getStorageSync("user");
          if (!userStr)
            return;
          const user = JSON.parse(userStr);
          const guardianId = user.id;
          const result = await get(`/binding/guardian/list/${guardianId}`);
          if (result.code === 200 && result.data) {
            elderlyOptions.value = result.data.map((item) => ({
              id: item.elderlyId,
              name: item.elderlyName || "老人"
            }));
            if (elderlyOptions.value.length > 0) {
              await loadFence();
            }
          }
        } catch (error) {
          formatAppLog("log", "at pages/fence/index.vue:135", "Load elderly list failed:", error);
        }
      };
      const loadFence = async () => {
        if (elderlyOptions.value.length === 0)
          return;
        const elderlyId = elderlyOptions.value[selectedIndex.value].id;
        try {
          const result = await get(`/fence/elderly/${elderlyId}`);
          if (result.code === 200 && result.data && result.data.length > 0) {
            const fence = result.data[0];
            fenceId.value = fence.id;
            fenceStatus.value = fence.enabled === 1 ? "active" : "inactive";
            fenceRadius.value = fence.radius;
            centerAddress.value = fence.name || "安全区域";
          } else {
            fenceId.value = null;
            fenceStatus.value = "inactive";
            fenceRadius.value = 500;
          }
        } catch (error) {
          formatAppLog("log", "at pages/fence/index.vue:157", "Load fence failed:", error);
        }
      };
      const loadHistory = async () => {
        if (elderlyOptions.value.length === 0)
          return;
        const elderlyId = elderlyOptions.value[selectedIndex.value].id;
        try {
          const result = await get(`/alarm/elderly/${elderlyId}`);
          if (result.code === 200 && result.data) {
            history.value = result.data.filter((item) => item.type === 2).map((item) => ({
              title: item.message,
              time: item.createTime
            }));
          }
        } catch (error) {
          formatAppLog("log", "at pages/fence/index.vue:176", "Load history failed:", error);
        }
      };
      const toggleFence = async (e) => {
        const isActive = e.detail.value;
        fenceStatus.value = isActive ? "active" : "inactive";
        if (elderlyOptions.value.length === 0)
          return;
        const elderlyId = elderlyOptions.value[selectedIndex.value].id;
        try {
          if (fenceId.value) {
            await put(`/fence/${fenceId.value}`, {
              enabled: isActive ? 1 : 0,
              radius: fenceRadius.value,
              name: centerAddress.value
            });
          } else {
            await post("/fence", {
              elderlyId,
              name: centerAddress.value || "安全区域",
              centerLatitude: 39.9904,
              centerLongitude: 116.4706,
              radius: fenceRadius.value,
              enabled: isActive ? 1 : 0
            });
            await loadFence();
          }
          uni.showToast({ title: isActive ? "围栏已开启" : "围栏已关闭", icon: "none" });
        } catch (error) {
          fenceStatus.value = isActive ? "inactive" : "active";
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      };
      const increaseRadius = async () => {
        if (fenceRadius.value < 2e3) {
          fenceRadius.value += 100;
          await saveRadius();
        }
      };
      const decreaseRadius = async () => {
        if (fenceRadius.value > 100) {
          fenceRadius.value -= 100;
          await saveRadius();
        }
      };
      const saveRadius = async () => {
        if (fenceId.value) {
          try {
            await put(`/fence/${fenceId.value}`, {
              radius: fenceRadius.value
            });
          } catch (error) {
            formatAppLog("log", "at pages/fence/index.vue:234", "Save radius failed:", error);
          }
        }
      };
      const toggleNotifications = (e) => {
        notifications.value = e.detail.value;
      };
      const goToSetCenter = () => {
        uni.navigateTo({ url: "/pages/fence/add" });
      };
      vue.onMounted(() => {
        loadElderlyList();
        loadHistory();
      });
      const __returned__ = { selectedIndex, fenceStatus, fenceRadius, notifications, fenceId, centerAddress, elderlyOptions, history, goBack, onElderlyChange, loadElderlyList, loadFence, loadHistory, toggleFence, increaseRadius, decreaseRadius, saveRadius, toggleNotifications, goToSetCenter };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "fence-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", {
          class: "header-back",
          onClick: $setup.goBack
        }, "‹"),
        vue.createElementVNode("text", { class: "header-title" }, "电子围栏"),
        vue.createElementVNode("text", { class: "header-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "elderly-select" }, [
        vue.createElementVNode("picker", {
          value: $setup.selectedIndex,
          range: $setup.elderlyOptions,
          "range-key": "name",
          onChange: $setup.onElderlyChange
        }, [
          vue.createElementVNode("view", { class: "picker-content" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString(((_a = $setup.elderlyOptions[$setup.selectedIndex]) == null ? void 0 : _a.name) || "选择老人"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
          ])
        ], 40, ["value", "range"])
      ]),
      vue.createElementVNode("view", { class: "map-section" }, [
        vue.createElementVNode("view", { class: "map-placeholder" }, [
          vue.createElementVNode("view", { class: "fence-marker" }, "📍"),
          vue.createElementVNode("view", { class: "fence-circle" }),
          vue.createElementVNode("text", { class: "map-text" }, "围栏区域"),
          vue.createElementVNode("view", { class: "fence-info" }, [
            vue.createElementVNode(
              "text",
              { class: "info-text" },
              "半径：" + vue.toDisplayString($setup.fenceRadius) + " 米",
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["status-card", $setup.fenceStatus])
        },
        [
          vue.createElementVNode(
            "view",
            { class: "status-icon" },
            vue.toDisplayString($setup.fenceStatus === "active" ? "✅" : "❌"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "status-content" }, [
            vue.createElementVNode(
              "text",
              { class: "status-title" },
              vue.toDisplayString($setup.fenceStatus === "active" ? "围栏已开启" : "围栏已关闭"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "status-desc" },
              vue.toDisplayString($setup.fenceStatus === "active" ? "老人离开安全区域将收到告警" : "请开启围栏保护老人安全"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("switch", {
            checked: $setup.fenceStatus === "active",
            onChange: $setup.toggleFence,
            color: "#1890ff"
          }, null, 40, ["checked"])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "围栏设置"),
        vue.createElementVNode("view", { class: "setting-item" }, [
          vue.createElementVNode("text", { class: "setting-label" }, "安全半径"),
          vue.createElementVNode("view", { class: "radius-control" }, [
            vue.createElementVNode("view", {
              class: "radius-btn",
              onClick: $setup.decreaseRadius
            }, "‹"),
            vue.createElementVNode(
              "text",
              { class: "radius-value" },
              vue.toDisplayString($setup.fenceRadius) + " 米",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "radius-btn",
              onClick: $setup.increaseRadius
            }, "›")
          ])
        ]),
        vue.createElementVNode("view", {
          class: "setting-item",
          onClick: $setup.goToSetCenter
        }, [
          vue.createElementVNode("text", { class: "setting-label" }, "中心位置"),
          vue.createElementVNode("view", { class: "setting-value-wrap" }, [
            vue.createElementVNode(
              "text",
              { class: "setting-value" },
              vue.toDisplayString($setup.centerAddress || "点击设置"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "setting-arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "setting-item" }, [
          vue.createElementVNode("text", { class: "setting-label" }, "告警通知"),
          vue.createElementVNode("switch", {
            checked: $setup.notifications,
            color: "#1890ff",
            onChange: $setup.toggleNotifications
          }, null, 40, ["checked"])
        ])
      ]),
      vue.createElementVNode("view", { class: "history-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "越界记录"),
        vue.createElementVNode("view", { class: "history-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.history, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "history-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "history-icon" }, "🚶"),
                vue.createElementVNode("view", { class: "history-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "history-title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "history-time" },
                    vue.toDisplayString(item.time),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesFenceIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-06256fcf"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/fence/index.vue"]]);
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "add",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.ref({
        name: "",
        address: "",
        longitude: 0,
        latitude: 0,
        radius: 500,
        customRadius: 500,
        alertType: "both",
        enabled: true
      });
      const showMapPicker = vue.ref(false);
      const radiusOptions = [200, 500, 1e3, 1500];
      const alertOptions = [
        { label: "APP推送", value: "app" },
        { label: "短信通知", value: "sms" },
        { label: "两者都有", value: "both" }
      ];
      const previewSize = vue.computed(() => {
        const radius = form.value.radius || form.value.customRadius || 500;
        return Math.min(400, radius / 2e3 * 400 + 100);
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const openMapPicker = () => {
        showMapPicker.value = true;
      };
      const closeMapPicker = () => {
        showMapPicker.value = false;
      };
      const onPickerMessage = (e) => {
        const data = e.detail.data[0];
        if (data.type === "locationSelected") {
          form.value.address = data.data.address || "已选位置";
          form.value.longitude = data.data.lng;
          form.value.latitude = data.data.lat;
          showMapPicker.value = false;
          uni.showToast({ title: "位置已选择", icon: "success" });
        } else if (data.type === "locationCancel") {
          showMapPicker.value = false;
        }
      };
      const onSliderChange = (e) => {
        form.value.customRadius = e.detail.value;
        form.value.radius = 0;
      };
      const saveFence = () => {
        if (!form.value.name) {
          uni.showToast({ title: "请输入围栏名称", icon: "none" });
          return;
        }
        if (!form.value.address) {
          uni.showToast({ title: "请选择位置", icon: "none" });
          return;
        }
        if (!form.value.longitude || !form.value.latitude) {
          uni.showToast({ title: "位置坐标无效", icon: "none" });
          return;
        }
        uni.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      };
      const __returned__ = { form, showMapPicker, radiusOptions, alertOptions, previewSize, goBack, openMapPicker, closeMapPicker, onPickerMessage, onSliderChange, saveFence };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "add-fence-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "‹")
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "添加围栏"),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode("text", {
            class: "save-btn",
            onClick: $setup.saveFence
          }, "保存")
        ])
      ]),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "围栏名称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.name = $event),
              placeholder: "请输入围栏名称"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.name]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "选择位置"),
          vue.createElementVNode("view", {
            class: "location-picker",
            onClick: $setup.openMapPicker
          }, [
            $setup.form.address ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "location-value"
              },
              vue.toDisplayString($setup.form.address),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "location-placeholder"
            }, "点击在地图上选择位置")),
            vue.createElementVNode("text", { class: "location-arrow" }, "›")
          ]),
          $setup.form.longitude && $setup.form.latitude ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "location-coords"
          }, [
            vue.createElementVNode(
              "text",
              null,
              "经度: " + vue.toDisplayString($setup.form.longitude.toFixed(6)) + " 纬度: " + vue.toDisplayString($setup.form.latitude.toFixed(6)),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "范围半径"),
          vue.createElementVNode("view", { class: "radius-selector" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.radiusOptions, (radius) => {
                return vue.createElementVNode("view", {
                  class: vue.normalizeClass(["radius-option", { active: $setup.form.radius === radius }]),
                  key: radius,
                  onClick: ($event) => $setup.form.radius = radius
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(radius) + "米",
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "自定义半径"),
          vue.createElementVNode("view", { class: "radius-slider" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "slider-input",
                type: "number",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.customRadius = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.customRadius]
            ]),
            vue.createElementVNode("text", { class: "slider-unit" }, "米")
          ]),
          vue.createElementVNode("slider", {
            value: $setup.form.customRadius,
            min: 100,
            max: 2e3,
            step: 50,
            activeColor: "#1989fa",
            backgroundColor: "#e8e8e8",
            "block-size": "20",
            onChange: $setup.onSliderChange
          }, null, 40, ["value"])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "告警方式"),
          vue.createElementVNode("view", { class: "alert-options" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.alertOptions, (option) => {
                return vue.createElementVNode("view", {
                  class: vue.normalizeClass(["alert-option", { active: $setup.form.alertType === option.value }]),
                  key: option.value,
                  onClick: ($event) => $setup.form.alertType = option.value
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(option.label),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "switch-row" }, [
            vue.createElementVNode("text", { class: "form-label" }, "启用围栏"),
            vue.createElementVNode("switch", {
              checked: $setup.form.enabled,
              onChange: _cache[2] || (_cache[2] = ($event) => $setup.form.enabled = !$setup.form.enabled),
              color: "#1989fa"
            }, null, 40, ["checked"])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "map-preview" }, [
        vue.createElementVNode("text", { class: "preview-title" }, "围栏预览"),
        vue.createElementVNode("view", { class: "preview-map" }, [
          vue.createElementVNode(
            "view",
            {
              class: "preview-area",
              style: vue.normalizeStyle({ width: $setup.previewSize + "rpx", height: $setup.previewSize + "rpx" })
            },
            [
              vue.createElementVNode("view", { class: "preview-center" })
            ],
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "text",
            { class: "preview-radius" },
            vue.toDisplayString($setup.form.radius || $setup.form.customRadius || 500) + "米",
            1
            /* TEXT */
          )
        ])
      ]),
      $setup.showMapPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "map-picker-mask"
      }, [
        vue.createElementVNode(
          "web-view",
          {
            id: "pickerWebView",
            src: "/static/tianditu-picker.html",
            onMessage: $setup.onPickerMessage,
            class: "map-picker-webview"
          },
          null,
          32
          /* NEED_HYDRATION */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesFenceAdd = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-433a9b71"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/fence/add.vue"]]);
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const user = vue.ref(null);
      const userIdStr = vue.computed(() => {
        var _a;
        if (!((_a = user.value) == null ? void 0 : _a.userId))
          return "000000";
        return String(user.value.userId).padStart(6, "0");
      });
      const loadUser = () => {
        const userStr = uni.getStorageSync("user");
        if (userStr) {
          user.value = JSON.parse(userStr);
        }
      };
      const goSettings = () => {
        uni.showToast({ title: "设置功能开发中", icon: "none" });
      };
      const goAbout = () => {
        uni.showToast({ title: "关于我们", icon: "none" });
      };
      const logout = () => {
        uni.showModal({
          title: "确认退出",
          content: "退出后需要重新登录",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("user");
              uni.removeStorageSync("isElderlyUser");
              uni.reLaunch({ url: "/pages/login/index" });
            }
          }
        });
      };
      vue.onMounted(() => {
        loadUser();
      });
      const __returned__ = { user, userIdStr, loadUser, goSettings, goAbout, logout };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "avatar" }, [
          vue.createElementVNode("text", { class: "avatar-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "user-name" },
            vue.toDisplayString(((_a = $setup.user) == null ? void 0 : _a.nickname) || "监护人"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "user-id" },
            "ID: " + vue.toDisplayString($setup.userIdStr),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-list" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: $setup.goSettings
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "⚙️"),
          vue.createElementVNode("text", { class: "menu-text" }, "设置"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: $setup.goAbout
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "ℹ️"),
          vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item logout",
          onClick: $setup.logout
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "🚪"),
          vue.createElementVNode("text", { class: "menu-text" }, "退出登录"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "version" }, [
        vue.createElementVNode("text", null, "健康守护 v1.0.0")
      ])
    ]);
  }
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-201c0da5"], ["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/pages/profile/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/register/index", PagesRegisterIndex);
  __definePage("pages/health/index", PagesHealthIndex);
  __definePage("pages/location/index", PagesLocationIndex);
  __definePage("pages/location/history", PagesLocationHistory);
  __definePage("pages/alarm/index", PagesAlarmIndex);
  __definePage("pages/bind/index", PagesBindIndex);
  __definePage("pages/fence/index", PagesFenceIndex);
  __definePage("pages/fence/add", PagesFenceAdd);
  __definePage("pages/profile/index", PagesProfileIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
      this.checkLoginStatus();
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:8", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:11", "App Hide");
    },
    methods: {
      checkLoginStatus() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.reLaunch({
            url: "/pages/login/index"
          });
        } else {
          uni.setStorageSync("isGuardianUser", "true");
        }
      }
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/1/Documents/trae_projects/OCA/frontend_guardian/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
