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
              <t-form-item label="名称" name="name">
                <t-input
                  v-model="formData.name"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入名称"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="关键字" name="word">
                <t-input
                  v-model="formData.word"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入关键字"
                  clearable
                  :style="{ minWidth: '80px' }"
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
        <template #op="slotProps">
          <a class="t-button-link" @click="handleRowEdit(slotProps)">编辑</a>
          <a class="t-button-link" @click="handleRowDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-dialog
        v-model:visible="deleteVisible"
        header="确认删除？"
        :on-cancel="cancelDelete"
        @confirm="confirmDelete"
      />
      <t-dialog v-model:visible="editVisible" :header="editHeader" :on-cancel="cancelEdit" @confirm="confirmEdit">
        <t-form :data="editFormData">
          <t-form-item label="名称" name="name">
            <t-input v-model="editFormData.name" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="关键字" name="word">
            <t-input v-model="editFormData.word" placeholder="请输入内容" />
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useSettingStore } from '@/store';
import { prefix } from '@/config/global';
import { createRole, deleteRole, findRole, updateRole } from '@/api/role';
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
    title: '名称',
    colKey: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '关键字',
    colKey: 'word',
    width: 200,
    ellipsis: true,
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
  name: '',
  word: '',
};
const editForm = {
  name: '',
  word: '',
};
const formData = ref({ ...searchForm });
const editFormData = ref({ ...editForm });
const deleteVisible = ref(false);
const editVisible = ref(false);
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
    const { list, page } = await findRole(params);
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

const deleteIdx = ref(-1);

const resetIdx = () => {
  deleteIdx.value = -1;
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
    await createRole(editFormData.value);
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
    await updateRole({
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
    await deleteRole(ids);
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
