<template>
  <div class="list-common-table">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      colon
      :style="{ marginBottom: '8px' }"
      @reset="handleReset"
      @submit="handleSubmit"
    >
      <t-row>
        <t-col :span="8">
          <t-row :gutter="[16, 24]">
            <t-col :span="4">
              <t-form-item label="唯一码" name="code">
                <t-input
                  v-model="formData.code"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入唯一码"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="用户名" name="username">
                <t-input
                  v-model="formData.username"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入用户名"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="平台" name="platform">
                <t-input
                  v-model="formData.platform"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入平台"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="状态" name="locked">
                <t-select
                  v-model="formData.locked"
                  class="form-item-content"
                  :options="LOCKED_OPTIONS"
                  placeholder="请选择状态"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>

        <t-col :span="4" class="operation-container">
          <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询</t-button>
          <t-button type="reset" variant="base" theme="default"> 重置</t-button>
          <t-button theme="primary" @click="handleCreate">
            <t-icon name="add" />
            新建
          </t-button>
          <t-button theme="danger" @click="handleDelete">
            <t-icon name="delete" />
            删除
          </t-button>
        </t-col>
      </t-row>
    </t-form>

    <div class="table-container">
      <t-table
        :data="data"
        :columns="COLUMNS"
        :row-key="rowKey"
        :vertical-align="verticalAlign"
        :hover="hover"
        :pagination="pagination"
        :loading="dataLoading"
        :header-affixed-top="{ offsetTop, container: getContainer }"
        :selected-row-keys="selectedRowKeys"
        @select-change="handleSelectChange"
        @page-change="handlePageChange"
      >
        <template #platform="{ row }">
          <t-tag theme="success" variant="light">{{ row.platform }}</t-tag>
        </template>
        <template #locked="{ row }">
          <t-tag v-if="row.locked === BOOL.FALSE" theme="success" variant="light">正常</t-tag>
          <t-tag v-if="row.locked === BOOL.TRUE" theme="danger" variant="light">已锁定</t-tag>
        </template>
        <template #op="slotProps">
          <a class="t-button-link" @click="handleRowEdit(slotProps)">编辑</a>
          <a v-if="slotProps.row.locked === BOOL.FALSE" class="t-button-link" @click="handleRowLock(slotProps)">锁定</a>
          <a v-else class="t-button-link" @click="handleRowUnlock(slotProps)">解锁</a>
          <a class="t-button-link" @click="handleRowDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-dialog
        v-model:visible="deleteVisible"
        header="确认删除？"
        :on-cancel="cancelDelete"
        @confirm="confirmDelete"
      />
      <t-dialog
        v-model:visible="unlockVisible"
        header="确认解锁？"
        :on-cancel="cancelUnlock"
        @confirm="confirmUnlock"
      />
      <t-dialog
        v-model:visible="editVisible"
        :header="isEdit ? '编辑' : '新增'"
        :on-cancel="cancelEdit"
        @confirm="confirmEdit"
      >
        <t-form :data="editFormData">
          <t-form-item label="用户名" name="username">
            <t-input v-model="editFormData.username" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="密码" name="password">
            <t-input v-model="editFormData.password" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="平台" name="platform">
            <t-input v-model="editFormData.platform" placeholder="请输入平台" />
          </t-form-item>
          <t-form-item v-if="isEdit" label="授权行为" name="action">
            <t-select-input
              v-model:inputValue="selectActionInput"
              :value="selectActionData"
              :allow-input="true"
              placeholder="请选择或输入"
              :tag-input-props="{ excessTagsDisplayType: 'break-line' }"
              clearable
              multiple
              @tag-change="selectActionTagChange"
              @input-change="selectActionInputChange"
            >
              <template #panel>
                <t-checkbox-group
                  v-if="selectActionOptions.length"
                  v-model="selectActionChecked"
                  :options="selectActionOptions"
                  @change="selectActionOptionsCheckedChange"
                />
                <div v-else class="tdesign-demo__select-empty-multiple">暂无数据</div>
              </template>
              <template #suffixIcon>
                <t-icon class="chevron-down" />
              </template>
            </t-select-input>
          </t-form-item>
        </t-form>
      </t-dialog>
      <t-dialog v-model:visible="lockVisible" header="锁定" :on-cancel="cancelLock" @confirm="confirmLock">
        <t-form :data="lockFormData">
          <t-form-item label="永久锁定" name="forever">
            <t-switch v-model="lockFormData.forever" />
          </t-form-item>
          <t-form-item v-if="!lockFormData.forever" label="截止时间" name="expire">
            <t-date-picker v-model="lockFormData.expire" enable-time-picker allow-input clearable />
          </t-form-item>
        </t-form>
      </t-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useSettingStore } from '@/store';
import { prefix } from '@/config/global';
import { BOOL, LOCKED_OPTIONS } from '@/constants';
import { deleteUser, findUser, register, updateUser } from '@/api/user';
import { findAction } from '@/api/action';

const store = useSettingStore();

const rowKey = 'id';
const verticalAlign = 'top';
const hover = true;
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});
const COLUMNS = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  {
    title: '序号',
    colKey: 'id',
    fixed: 'left',
    width: 220,
    ellipsis: true,
    align: 'left',
  },
  {
    title: '唯一码',
    colKey: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户名',
    colKey: 'username',
    width: 150,
    ellipsis: true,
  },
  {
    title: '创建时间',
    colKey: 'createdAt',
    width: 200,
    ellipsis: true,
  },
  {
    title: '更新时间',
    colKey: 'updatedAt',
    width: 200,
    ellipsis: true,
  },
  {
    title: '平台',
    colKey: 'platform',
    width: 200,
    cell: {
      col: 'platform',
    },
  },
  {
    title: '状态',
    colKey: 'locked',
    width: 200,
    cell: {
      col: 'locked',
    },
  },
  {
    title: '锁定时长',
    colKey: 'lockMsg',
    width: 200,
  },
  {
    align: 'left',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: '操作',
  },
];

const searchForm = {
  code: '',
  username: '',
  status: undefined,
};
const editForm = {
  username: '',
  password: '',
  platform: '',
};
const lockForm = {
  forever: false,
  expire: '',
};
const formData = ref({ ...searchForm });
const editFormData = ref({ ...editForm });
const lockFormData = ref({ ...lockForm });
const deleteVisible = ref(false);
const editVisible = ref(false);
const lockVisible = ref(false);
const unlockVisible = ref(false);
const editHeader = ref('');
const isEdit = ref(false);
const data = ref([]);
const selectedRowKeys = ref([]);
const dataLoading = ref(false);

const fetchData = async () => {
  dataLoading.value = true;
  const params = {
    ...formData.value,
    'page.num': pagination.value.current,
    'page.size': pagination.value.pageSize,
  };
  try {
    const { list, page } = await findUser(params);
    data.value = list;
    pagination.value = {
      current: Number(page.num),
      pageSize: Number(page.size),
      total: Number(page.total),
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const fetchActionData = async () => {
  const params = {
    word: selectActionInput.value,
    'page.num': pagination.value.current,
    'page.size': pagination.value.pageSize,
  };
  try {
    const { list } = await findAction(params);
    const arr = [];
    for (const k in list) {
      arr.push({
        label: `${list[k].word}[${list[k].name}]`,
        value: list[k].code,
      });
    }
    selectActionOptions.value = arr;
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const unlockIdx = ref(-1);

const cancelUnlock = () => {
  unlockVisible.value = false;
};

const confirmUnlock = async () => {
  const params = {
    id: unlockIdx.value,
    locked: 0,
  };
  try {
    await updateUser(params);
    MessagePlugin.success('解锁成功');
    await fetchData();
    unlockVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const lockIdx = ref(-1);

const cancelLock = () => {
  lockVisible.value = false;
};

const confirmLock = async () => {
  const params = {
    id: lockIdx.value,
    locked: 1,
    lockExpireTime: '',
  };
  if (!lockFormData.value.forever) {
    params.lockExpireTime = lockFormData.value.expire;
    if (params.lockExpireTime === '') {
      MessagePlugin.warning('请选择截止时间');
      return;
    }
  }
  try {
    await updateUser(params);
    MessagePlugin.success('锁定成功');
    await fetchData();
    lockVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const deleteIdx = ref(-1);

const resetIdx = () => {
  deleteIdx.value = -1;
  lockIdx.value = -1;
};

const confirmDelete = async () => {
  await deleteByIds([deleteIdx.value]);
};

const cancelDelete = () => {
  resetIdx();
};

const showEdit = (row) => {
  if (row) {
    editFormData.value = row;
    editHeader.value = `编辑${row.id}`;
    const arr2 = [];
    for (const k in row.actions) {
      arr2.push({
        label: `${row.actions[k].word}[${row.actions[k].name}]`,
        value: row.actions[k].code,
      });
    }
    selectActionData.value = arr2;
    selectActionCheckedChange();
  } else {
    editHeader.value = '新增';
  }
  editVisible.value = true;
};

const cancelEdit = () => {
  editVisible.value = false;
};

const doCreate = async () => {
  try {
    await register(editFormData.value);
    MessagePlugin.success('新建成功');
    await fetchData();
    editVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const doEdit = async () => {
  try {
    const arr2 = [];
    for (const k in selectActionData.value) {
      arr2.push(selectActionData.value[k].value);
    }
    await updateUser({
      ...editFormData.value,
      action: arr2.join(','),
    });
    MessagePlugin.success('修改成功');
    await fetchData();
    editVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const confirmEdit = async () => {
  if (isEdit.value) {
    await doEdit();
  } else {
    await doCreate();
  }
};

const deleteByIds = async (ids) => {
  if (ids.length === 0) {
    MessagePlugin.warning('请至少选择一条数据');
    return;
  }
  try {
    await deleteUser(ids);
    MessagePlugin.success('删除成功');
    deleteVisible.value = false;
    resetIdx();
    await fetchData();
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    selectedRowKeys.value = [];
  }
};

const handleRowEdit = ({ row }) => {
  isEdit.value = true;
  showEdit(row);
  console.log(row);
};

const handleRowDelete = ({ row }) => {
  deleteIdx.value = row.id;
  deleteVisible.value = true;
};

const handleRowLock = ({ row }) => {
  lockIdx.value = row.id;
  lockVisible.value = true;
};

const handleRowUnlock = ({ row }) => {
  unlockIdx.value = row.id;
  unlockVisible.value = true;
};

const handleCreate = ({ row }) => {
  isEdit.value = false;
  editFormData.value = editForm;
  showEdit(row);
};

const handleDelete = async () => {
  await deleteByIds(selectedRowKeys.value);
};

const handleSelectChange = (value) => {
  selectedRowKeys.value = value;
};

const handleReset = (val) => {
  console.log(val);
};

const handleSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    await fetchData();
  }
};

const handlePageChange = (curr) => {
  pagination.value.current = curr.current;
  pagination.value.pageSize = curr.pageSize;
  fetchData();
};

const selectActionOptions = ref([]);
const selectActionInput = ref('');
const selectActionData = ref([]);
const selectActionChecked = ref([]);

const selectActionCheckedChange = () => {
  const arr = [];
  const list = selectActionData.value;
  for (let i = 0, len = list.length; i < len; i++) {
    arr.push(list[i].value);
  }
  selectActionChecked.value = arr;
  selectActionInput.value = '';
  fetchActionData();
};

const selectActionOptionsCheckedChange = (val, { current, type }) => {
  if (!current) {
    selectActionData.value = type === 'check' ? selectActionData.value.slice(1) : [];
    return;
  }
  if (type === 'check') {
    const option = selectActionOptions.value.find((t) => t.value === current);
    selectActionData.value.push(option);
  } else {
    selectActionData.value = selectActionData.value.filter((v) => v.value !== current);
  }
  selectActionCheckedChange();
};

const selectActionTagChange = (currentTags, context) => {
  const { trigger, index, item } = context;
  if (trigger === 'clear') {
    selectActionData.value = [];
  }
  if (['tag-remove'].includes(trigger)) {
    selectActionData.value.splice(index, 1);
  }
  if (trigger === 'enter') {
    const current = { label: item, value: item };
    selectActionData.value.push(current);
    selectActionOptions.value = selectActionOptions.value.concat(current);
    selectActionInput.value = '';
  }
  selectActionCheckedChange();
};

const selectActionInputChange = () => {
  fetchActionData();
};

onMounted(() => {
  fetchData();
});

const offsetTop = computed(() => {
  return store.isUseTabsRouter ? 48 : 0;
});

const getContainer = () => {
  return document.querySelector(`.${prefix}-layout`);
};
</script>

<style lang="less" scoped>
.list-common-table {
  background-color: var(--td-bg-color-container);
  padding: 30px 32px;
  border-radius: @border-radius;

  .table-container {
    margin-top: 30px;
  }
}

.form-item-content {
  width: 100%;
}

.operation-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .expand {
    .t-button__text {
      display: flex;
      align-items: center;
    }

    .t-icon {
      margin-left: 4px;
      transition: transform 0.3s ease;
    }
  }
}

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}
</style>
