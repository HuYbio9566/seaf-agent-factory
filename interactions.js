function syncAlertExpandability(root, expanded = false) {
  const description = root.querySelector('[data-alert-description]');
  const toggle = root.querySelector('[data-alert-toggle]');
  const toggleRow = root.querySelector('.alert__toggle-row');
  if (!description || !toggle) return;

  description.classList.add('alert__description--clamp');
  const needsToggle =
    description.scrollHeight > description.clientHeight + 1 ||
    description.scrollWidth > description.clientWidth + 1;

  if (toggleRow) {
    toggleRow.hidden = !needsToggle;
  }
  toggle.hidden = !needsToggle;

  if (!needsToggle) {
    description.classList.remove('alert__description--clamp');
    toggle.setAttribute('aria-expanded', 'false');
    return false;
  }

  return true;
}

function setAlertExpanded(root, expanded) {
  const description = root.querySelector('[data-alert-description]');
  const toggle = root.querySelector('[data-alert-toggle]');
  const descriptionWrap = root.querySelector('.alert__description-wrap');
  if (!description || !toggle) return;

  const canExpand = syncAlertExpandability(root, expanded);
  if (!canExpand) return;

  if (descriptionWrap) {
    window.clearTimeout(root._collapseTimer);
    if (expanded) {
      description.classList.remove('alert__description--clamp');
      descriptionWrap.classList.remove('is-collapsing');
      descriptionWrap.classList.add('is-expanded');
      descriptionWrap.style.maxHeight = `${description.scrollHeight}px`;
    } else {
      descriptionWrap.classList.remove('is-expanded');
      descriptionWrap.classList.add('is-collapsing');
      descriptionWrap.style.maxHeight = `${description.scrollHeight}px`;
      window.requestAnimationFrame(() => {
        description.classList.add('alert__description--clamp');
        descriptionWrap.style.maxHeight = `${description.clientHeight}px`;
      });
      root._collapseTimer = window.setTimeout(() => {
        descriptionWrap.classList.remove('is-collapsing');
      }, 200);
    }
  } else {
    description.classList.toggle('alert__description--clamp', !expanded);
  }
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  toggle.textContent = expanded
    ? (toggle.dataset.collapseLabel || '收起')
    : (toggle.dataset.expandLabel || '展开更多');
}

document.addEventListener('click', event => {
  const closeButton = event.target.closest('[data-alert-close]');
  if (closeButton) {
    const root = closeButton.closest('[data-alert-demo]');
    if (root) {
      root.hidden = true;
    }
    return;
  }

  const toggleButton = event.target.closest('[data-alert-toggle]');
  if (!toggleButton) return;

  const root = toggleButton.closest('[data-alert-demo]');
  if (!root) return;

  const nextExpanded = toggleButton.getAttribute('aria-expanded') !== 'true';
  setAlertExpanded(root, nextExpanded);
});

document.querySelectorAll('[data-alert-demo]').forEach(root => {
  const toggle = root.querySelector('[data-alert-toggle]');
  if (!toggle) return;
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  setAlertExpanded(root, expanded);
});

window.addEventListener('resize', () => {
  document.querySelectorAll('[data-alert-demo]').forEach(root => {
    const toggle = root.querySelector('[data-alert-toggle]');
    if (!toggle) return;
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setAlertExpanded(root, expanded);
  });
});

function getSelectLayerHost(root) {
  return root.closest('.select-layer-host');
}

function syncSelectLayerHost(root, open) {
  const host = getSelectLayerHost(root);
  if (!host) return;

  if (open) {
    host.classList.add('has-open-select');
    return;
  }

  const hasOpenSelect = host.querySelector('[data-select-demo].is-active');
  host.classList.toggle('has-open-select', Boolean(hasOpenSelect));
}

function setSelectDemoOpen(root, open) {
  const trigger = root.querySelector('[data-select-trigger]');
  const panel = root.querySelector('[data-select-panel]');
  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (panel._hideTimer) {
    window.clearTimeout(panel._hideTimer);
    panel._hideTimer = null;
  }

  if (open) {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.remove('select-panel--open');
    window.requestAnimationFrame(() => {
      panel.classList.add('select-panel--open');
    });
  } else {
    panel.setAttribute('aria-hidden', 'true');
    panel.classList.remove('select-panel--open');
    panel._hideTimer = window.setTimeout(() => {
      panel.hidden = true;
      panel._hideTimer = null;
    }, 200);
  }

  root.classList.toggle('is-active', open);
  syncSelectLayerHost(root, open);
}

function closeAllSelectDemos(exceptRoot = null) {
  document.querySelectorAll('[data-select-demo]').forEach(root => {
    if (root !== exceptRoot) {
      setSelectDemoOpen(root, false);
    }
  });
}

document.querySelectorAll('[data-select-demo]').forEach(root => {
  const trigger = root.querySelector('[data-select-trigger]');
  const valueNode = root.querySelector('[data-select-value]');
  const options = root.querySelectorAll('[data-select-option]');
  const panel = root.querySelector('[data-select-panel]');

  if (!trigger || !valueNode || !panel || !options.length) return;
  const startsOpen = trigger.getAttribute('aria-expanded') === 'true';
  panel.setAttribute('aria-hidden', startsOpen ? 'false' : 'true');
  if (!startsOpen) panel.hidden = true;

  trigger.addEventListener('click', () => {
    if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
    closeAllSelectDemos(root);
    setSelectDemoOpen(root, willOpen);
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      const nextValue = option.dataset.value || option.textContent.trim();
      valueNode.textContent = nextValue;
      valueNode.classList.remove('select-trigger__value--placeholder', 'select-combo__value--placeholder');

      options.forEach(item => {
        const isSelected = item === option;
        item.classList.toggle('select-panel__item--selected', isSelected);
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      setSelectDemoOpen(root, false);
    });
  });
});

document.addEventListener('click', event => {
  document.querySelectorAll('[data-select-demo]').forEach(root => {
    if (!root.contains(event.target)) {
      setSelectDemoOpen(root, false);
    }
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeAllSelectDemos();
  }
});

function initTextareaDemos() {
  document.querySelectorAll('[data-textarea-demo]').forEach(root => {
    const input = root.querySelector('[data-textarea-input]');
    if (!input) return;

    const group = root.closest('.textarea-group');
    const countNode = root.querySelector('[data-textarea-count]');
    const helper = root.querySelector('[data-textarea-helper]') || group?.querySelector('[data-textarea-helper]');
    const helperMessage =
      root.querySelector('[data-textarea-helper-message]') || group?.querySelector('[data-textarea-helper-message]');
    const maxLength = Number(root.dataset.maxlength || input.getAttribute('maxlength') || 0);
    const minLength = Number(root.dataset.minlength || 0);
    const errorMessage = root.dataset.errorMessage || '';

    function updateCount() {
      if (!countNode) return;
      const valueLength = input.value.length;
      countNode.textContent = maxLength > 0 ? `${valueLength} / ${maxLength}` : `${valueLength}`;
    }

    function applyValidation(force = false) {
      if (!minLength || input.disabled) return;

      const trimmedLength = input.value.trim().length;
      const touched = root.dataset.touched === 'true';
      const initiallyInvalid = root.dataset.initialError === 'true';
      const shouldShow = force || touched || initiallyInvalid;
      const remaining = Math.max(minLength - trimmedLength, 0);
      const hasError = shouldShow && remaining > 0;

      root.classList.toggle('textarea-shell--error', hasError);
      input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
      if (helper) helper.hidden = !hasError;
      if (helperMessage && errorMessage) {
        helperMessage.textContent = hasError && remaining > 0
          ? `${errorMessage}，还差 ${remaining} 个字`
          : errorMessage;
      }
    }

    updateCount();
    applyValidation(root.dataset.initialError === 'true');

    input.addEventListener('input', () => {
      updateCount();
      if (root.dataset.liveValidate === 'true' || root.dataset.touched === 'true' || root.dataset.initialError === 'true') {
        applyValidation(true);
      }
    });

    input.addEventListener('blur', () => {
      root.dataset.touched = 'true';
      applyValidation(true);
    });
  });
}

function initTableSelectionDemos() {
  document.querySelectorAll('[data-table-select-demo]').forEach(root => {
    const selectAll = root.querySelector('[data-table-select-all]');
    const rowCheckboxes = [...root.querySelectorAll('[data-table-row-checkbox]')];
    if (!selectAll || !rowCheckboxes.length) return;

    function syncRowsAndHeader() {
      const selectedCount = rowCheckboxes.filter(checkbox => checkbox.checked).length;
      selectAll.checked = selectedCount === rowCheckboxes.length;
      selectAll.indeterminate = selectedCount > 0 && selectedCount < rowCheckboxes.length;
      selectAll.classList.toggle('indeterminate', selectAll.indeterminate);

      rowCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('[data-table-row]');
        if (row) row.classList.toggle('is-selected', checkbox.checked);
      });
    }

    selectAll.addEventListener('change', () => {
      rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
      });
      syncRowsAndHeader();
    });

    rowCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', syncRowsAndHeader);
    });

    syncRowsAndHeader();
  });
}

const messageIcons = {
  notice: 'info',
  success: 'circle-check',
  error: 'circle-x',
  warning: 'triangle-alert',
};

function dismissMessage(message) {
  if (!message || message.dataset.dismissing === 'true') return;
  message.dataset.dismissing = 'true';
  if (message._dismissTimer) {
    window.clearTimeout(message._dismissTimer);
  }
  message.classList.add('is-leaving');
  window.setTimeout(() => message.remove(), 180);
}

function showMessage({ tone = 'notice', text = '', closable = false, duration = 3000 } = {}) {
  const stack = document.querySelector('[data-message-stack]');
  if (!stack) return;

  const resolvedTone = messageIcons[tone] ? tone : 'notice';
  const message = document.createElement('div');
  message.className = `message message--transient message--${resolvedTone}${closable ? ' message--closable' : ''}`;
  message.setAttribute('role', 'status');

  const main = document.createElement('div');
  main.className = 'message__main';
  const icon = document.createElement('span');
  icon.className = 'message__icon';
  icon.setAttribute('aria-hidden', 'true');
  const iconGlyph = document.createElement('i');
  iconGlyph.setAttribute('data-lucide', messageIcons[resolvedTone]);
  icon.appendChild(iconGlyph);
  const textNode = document.createElement('p');
  textNode.className = 'message__text';
  textNode.textContent = text;
  main.append(icon, textNode);
  message.appendChild(main);

  if (closable) {
    const close = document.createElement('button');
    close.className = 'message__close';
    close.type = 'button';
    close.setAttribute('data-message-close', '');
    close.setAttribute('aria-label', '关闭消息');
    const closeIcon = document.createElement('i');
    closeIcon.setAttribute('data-lucide', 'x');
    close.appendChild(closeIcon);
    message.appendChild(close);
  }

  stack.appendChild(message);
  window.requestAnimationFrame(() => message.classList.add('is-visible'));
  if (duration > 0) {
    message._dismissTimer = window.setTimeout(() => dismissMessage(message), duration);
  }
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('click', event => {
  const close = event.target.closest('[data-message-close]');
  if (close) {
    dismissMessage(close.closest('.message'));
    return;
  }

  const trigger = event.target.closest('[data-message-trigger]');
  if (!trigger) return;
  showMessage({
    tone: trigger.dataset.messageTone || 'notice',
    text: trigger.dataset.messageText || '',
    closable: trigger.dataset.messageClosable === 'true',
    duration: Number(trigger.dataset.messageDuration || 3000),
  });
});

initTextareaDemos();
initTableSelectionDemos();

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}
(function() {
  const t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();

// Tabs
document.querySelectorAll('[data-tabs]').forEach(container => {
  const tabsList = container.querySelector('[data-tabs-list]');
  if (!tabsList) return;
  const triggers = [...tabsList.querySelectorAll('[data-tab-trigger]')];
  const panels = [...container.querySelectorAll('[data-tab-panel]')];

  function activate(target, shouldFocus = false) {
    if (!target || target.disabled) return;
    const value = target.dataset.tabTrigger;
    triggers.forEach(trigger => {
      const selected = trigger === target;
      trigger.classList.toggle('is-active', selected);
      trigger.setAttribute('aria-selected', selected ? 'true' : 'false');
      trigger.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.dataset.tabPanel.split(/\s+/).includes(value);
      panel.classList.toggle('active', selected);
      panel.hidden = !selected;
    });
    container.querySelectorAll('[data-tab-show]').forEach(element => {
      element.hidden = element.dataset.tabShow !== value;
    });
    if (shouldFocus) target.focus();
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => activate(trigger));
    trigger.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const enabled = triggers.filter(item => !item.disabled);
      const currentIndex = enabled.indexOf(triggers[index]);
      if (currentIndex === -1 || !enabled.length) return;
      let target = enabled[currentIndex];
      if (event.key === 'ArrowRight') target = enabled[(currentIndex + 1) % enabled.length];
      if (event.key === 'ArrowLeft') target = enabled[(currentIndex - 1 + enabled.length) % enabled.length];
      if (event.key === 'Home') target = enabled[0];
      if (event.key === 'End') target = enabled[enabled.length - 1];
      activate(target, true);
    });
  });

  const defaultValue = container.dataset.defaultValue;
  const initial = triggers.find(trigger => trigger.dataset.tabTrigger === defaultValue)
    || triggers.find(trigger => trigger.getAttribute('aria-selected') === 'true')
    || triggers[0];
  if (initial) activate(initial);
});

window.showMessage = showMessage;

const builtinPromptPanel = document.querySelector('[data-page-panel="prompts"] [data-tab-panel="builtin-prompts"]');
const customPromptPanel = document.querySelector('[data-page-panel="prompts"] [data-tab-panel="custom-prompts"]');
const builtinPromptTable = builtinPromptPanel?.querySelector('.table-shell');
const customPromptTable = customPromptPanel?.querySelector('.table-shell');
const builtinPromptPagination = builtinPromptPanel?.querySelector('.pagination-bar');
const customPromptPagination = customPromptPanel?.querySelector('.pagination-bar');
const mirrorBuiltinPromptContent = () => {
  const sourceTable = builtinPromptPanel?.querySelector('.table-shell');
  const targetTable = customPromptPanel?.querySelector('.table-shell');
  const sourcePagination = builtinPromptPanel?.querySelector('.pagination-bar');
  const targetPagination = customPromptPanel?.querySelector('.pagination-bar');
  if (sourceTable && targetTable) targetTable.replaceWith(sourceTable.cloneNode(true));
  if (sourcePagination && targetPagination) targetPagination.replaceWith(sourcePagination.cloneNode(true));
};
mirrorBuiltinPromptContent();
document.querySelectorAll('[data-tab-trigger="custom-prompts"]').forEach(trigger => {
  trigger.addEventListener('click', mirrorBuiltinPromptContent);
});

document.querySelectorAll('[data-page-panel="widgets"] [data-tab-panel="widget-plaza"] [data-widget-resource-card]').forEach(card => {
  const content = card.children[1];
  const header = content?.querySelector(':scope > div.flex.items-start');
  const tag = header?.querySelector(':scope > .tag');
  const updated = content?.querySelector(':scope > p:nth-of-type(2)');
  const actions = content?.querySelector(':scope > div.mt-auto');
  if (!tag || !updated || !actions) return;
  const meta = document.createElement('div');
  meta.className = 'widget-resource-meta mt-3 flex items-center gap-2 text-xs text-muted-foreground';
  tag.remove();
  updated.classList.remove('mt-3');
  meta.append(tag, updated);
  content.insertBefore(meta, actions);
});

if (window.lucide) {
  document.querySelectorAll('[data-page-panel="connectors-tools"] [data-tab-panel="mcp-plaza my-mcp"] section.grid article.card-glass > div.flex.items-start > span i[data-lucide="paperclip"]').forEach((icon, index) => {
    icon.setAttribute('data-lucide', ['database', 'radar', 'wrench', 'plug-zap'][index] || 'database');
  });
  window.lucide.createIcons();
}

document.querySelectorAll('[data-page-panel="connectors-tools"] [data-tab-panel="mcp-plaza my-mcp"] section.grid article.card-glass').forEach((card, index) => {
  const badge = document.createElement('span');
  const isOfficial = index < 2;
  badge.className = `mcp-source-badge mcp-source-badge--${isOfficial ? 'official' : 'custom'} tag tag--solid`;
  badge.dataset.tabShow = 'mcp-plaza';
  badge.textContent = isOfficial ? '官方' : '自建';
  card.prepend(badge);
});

const promptFilterSection = document.querySelector('[data-page-panel="prompts"] [data-tab-panel="builtin-prompts"] > section:first-child');
const promptCategoryItems = promptFilterSection?.querySelector('.contents');
if (promptFilterSection && promptCategoryItems) {
  const promptSearchActions = promptCategoryItems.nextElementSibling;
  const promptCreateButton = document.querySelector('[data-page-panel="prompts"] > [data-tabs] > div:first-child > button') || document.createElement('button');
  const promptCategoryRow = document.createElement('div');
  promptCategoryItems.querySelector(':scope > .mr-2.text-sm.font-medium')?.remove();
  promptFilterSection.className = 'prompt-filter-stack flex flex-col gap-4';
  promptCategoryRow.className = 'prompt-category-row flex flex-wrap items-center gap-2';
  while (promptCategoryItems.firstChild) promptCategoryRow.append(promptCategoryItems.firstChild);
  promptCategoryItems.replaceWith(promptCategoryRow);
  if (promptSearchActions) {
    promptSearchActions.querySelectorAll(':scope > button').forEach(button => button.remove());
    promptSearchActions.classList.add('prompt-search-row');
    promptCreateButton.className = 'btn btn-primary btn-md ml-auto';
    promptCreateButton.type = 'button';
    promptCreateButton.setAttribute('data-message-trigger', '');
    promptCreateButton.setAttribute('data-message-tone', 'success');
    promptCreateButton.setAttribute('data-message-text', '新建模板包含：模板名称、模板描述、模板分类和提示词');
    promptCreateButton.innerHTML = '<i data-lucide="plus" class="h-4 w-4"></i>新建模板';
    promptSearchActions.append(promptCreateButton);
    promptFilterSection.prepend(promptSearchActions);
    window.lucide?.createIcons();
  }
}


// SEAF multi-page prototype runtime
(function () {
  const agentAvatarSources = Array.from({ length: 12 }, (_, index) =>
    `assets/agent-avatars/avatar-${String(index + 1).padStart(2, '0')}.png`
  );
  document.querySelectorAll('[data-agent-card] > .flex.items-start > span:first-child').forEach((avatar, index) => {
    const image = document.createElement('img');
    image.src = agentAvatarSources[index % agentAvatarSources.length];
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.className = 'agent-card-avatar';
    avatar.replaceWith(image);
  });
  document.querySelectorAll('[data-agent-type-chip]').forEach(chip => {
    const tags = chip.closest('[data-agent-card]')?.querySelector('.mt-4.flex.flex-wrap.gap-2');
    if (!tags) return;
    chip.className = 'tag tag--solid tag--neutral';
    tags.append(chip);
  });
  const navItems = [...document.querySelectorAll('[data-prototype-nav]')];
  const panels = [...document.querySelectorAll('[data-page-panel]')];
  const breadcrumb = document.querySelector('#breadcrumb-current');
  function activate(item, announce = true) {
    if (!item) return;
    const target = item.dataset.target;
    navItems.forEach(link => {
      const selected = link === item;
      link.classList.toggle('bg-primary', selected);
      link.classList.toggle('text-primary-foreground', selected);
      link.classList.toggle('text-foreground', !selected);
      selected ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    });
    panels.forEach(panel => {
      const selected = panel.dataset.pagePanel === target;
      panel.hidden = !selected;
      panel.classList.toggle('hidden', !selected);
      panel.classList.toggle('flex', selected);
    });
    if (breadcrumb) breadcrumb.textContent = item.dataset.label || '';
    if (target === 'widgets') {
      document.querySelector('[data-page-panel="widgets"] [data-tab-trigger="widget-plaza"]')?.click();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (announce && window.showMessage) window.showMessage({ tone: 'success', text: `已进入${item.dataset.label}`, duration: 1400 });
  }
  navItems.forEach(item => item.addEventListener('click', event => { event.preventDefault(); activate(item); history.replaceState(null, '', `#${item.dataset.target}`); }));
  const sidebarCollapse = document.querySelector('[data-sidebar-collapse]');
  sidebarCollapse?.addEventListener('click', () => {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    sidebarCollapse.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
    sidebarCollapse.setAttribute('aria-label', collapsed ? '展开侧栏' : '收起侧栏');
    const icon = sidebarCollapse.querySelector('[data-lucide]');
    if (icon) icon.setAttribute('data-lucide', collapsed ? 'panel-left-open' : 'panel-left-close');
    window.lucide?.createIcons?.();
  });
  document.querySelector('[data-sidebar-operations]')?.addEventListener('click', () => {
    const operationsPage = navItems.find(item => item.dataset.target === 'members');
    if (!operationsPage) return;
    activate(operationsPage);
    history.replaceState(null, '', '#members');
  });
  const initial = navItems.find(item => item.dataset.target === location.hash.slice(1)) || navItems[0];
  activate(initial, false);

  // Reference-frame home builder and Agent Management interactions.
  const homeBuilder = document.querySelector('[data-home-builder]');
  const homeBuilderInput = document.querySelector('[data-home-builder-input]');
  const homePanel = document.querySelector('[data-page-panel="home"]');
  const homeTitle = homeBuilder?.querySelector('h1');
  const homeDescription = homeBuilder?.querySelector('h1 + p');
  const homeRecentSection = homePanel?.querySelector('section.mt-8');
  const homeRecentTitle = homeRecentSection?.querySelector('h2');
  const homeRecentCards = [...(homeRecentSection?.querySelectorAll('.grid > button.card-glass') || [])];
  const homeModes = {
    agent: {
      title: '今天想构建什么？',
      description: '描述你的业务目标，让 AI 将想法快速变成可用的智能体。',
      placeholder: '描述你想创建的智能体，例如：帮我创建一个企业制度问答助手',
      recentTitle: '最近智能体',
      cards: [
        ['研', '研发问答助手', '连接研发知识库，回答规范、流程与技术问题。', '知识问答', '刚刚使用'],
        ['报', '日报总结助手', '汇总项目进展，提炼风险、结论与下一步计划。', '自主规划', '昨天使用'],
        ['数', '数据分析助手', '理解业务数据，生成指标解读与图表建议。', '数据分析', '2 天前使用'],
      ],
    },
    workflow: {
      title: '今天想编排什么？',
      description: '描述你的业务目标，让 AI 将想法快速变成可用的工作流。',
      placeholder: '描述你想创建的工作流，例如：收到反馈后自动分类并生成处理建议',
      recentTitle: '最近工作流',
      cards: [
        ['流', '客户反馈自动分流', '接收反馈后自动分类、分派并通知负责人。', '流程自动化', '刚刚使用'],
        ['周', '周报汇总与发送', '汇总团队进展，生成周报并定时发送给相关成员。', '办公效率', '昨天使用'],
        ['审', '合同审批流程', '串联合同提交、风险检查和多级审批节点。', '审批流程', '2 天前使用'],
      ],
    },
  };
  const applyHomeMode = mode => {
    const content = homeModes[mode] || homeModes.agent;
    if (homeTitle) homeTitle.textContent = content.title;
    if (homeDescription) homeDescription.textContent = content.description;
    if (homeBuilderInput) homeBuilderInput.placeholder = content.placeholder;
    if (homeRecentTitle) homeRecentTitle.textContent = content.recentTitle;
    content.cards.forEach((card, index) => {
      const element = homeRecentCards[index];
      if (!element) return;
      const avatar = element.querySelector(':scope > span');
      const title = element.querySelector(':scope h3');
      const description = element.querySelector(':scope p');
      const tag = element.querySelector('.home-recent-agent-tag');
      const usage = tag?.parentElement?.querySelector('span:last-child');
      if (avatar) avatar.textContent = card[0];
      if (title) title.textContent = card[1];
      if (description) description.textContent = card[2];
      if (tag) tag.textContent = card[3];
      if (usage) usage.textContent = card[4];
    });
  };
  document.querySelectorAll('[data-home-build-tab]').forEach(tab => tab.addEventListener('click', () => {
    const mode = tab.dataset.homeBuildTab;
    document.querySelectorAll('[data-home-build-tab]').forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    if (homeBuilder) homeBuilder.dataset.mode = mode;
    applyHomeMode(mode);
  }));
  applyHomeMode(homeBuilder?.dataset.mode || 'agent');
  const homeBuildSend = document.querySelector('[data-home-build-send]');
  const syncHomeBuildState = () => {
    if (homeBuildSend) homeBuildSend.disabled = !homeBuilderInput?.value.trim();
  };
  homeBuilderInput?.addEventListener('input', syncHomeBuildState);
  syncHomeBuildState();
  homeBuildSend?.addEventListener('click', () => {
    if (!homeBuilderInput?.value.trim()) { homeBuilderInput?.focus(); return; }
    window.showMessage?.({ tone: 'success', text: '需求已提交，正在进入智能构建流程（原型演示）' });
  });
  document.querySelectorAll('[data-home-view-agents]').forEach(button => button.addEventListener('click', () => {
    const agentsNav = navItems.find(item => item.dataset.target === 'agents');
    activate(agentsNav);
    history.replaceState(null, '', '#agents');
  }));

  const agentSearch = document.querySelector('[data-agent-search]');
  const agentFilterValues = { type: 'all', status: 'all' };
  const agentCards = Array.from(document.querySelectorAll('[data-agent-card]'));
  const filterAgentCards = () => {
    const query = (agentSearch?.value || '').trim().toLowerCase();
    const type = agentFilterValues.type;
    const status = agentFilterValues.status;
    agentCards.forEach(card => {
      const visible = (!query || (card.dataset.agentSearchText || '').toLowerCase().includes(query)) && (type === 'all' || card.dataset.agentType === type) && (status === 'all' || card.dataset.agentStatus === status);
      card.hidden = !visible;
      card.classList.toggle('hidden', !visible);
    });
  };
  agentSearch?.addEventListener('input', filterAgentCards);
  document.querySelectorAll('[data-agent-filter-demo] [data-agent-filter-value]').forEach(option => option.addEventListener('click', () => {
    agentFilterValues[option.closest('[data-agent-filter-demo]')?.dataset.agentFilterDemo] = option.dataset.agentFilterValue || 'all';
    filterAgentCards();
  }));
  document.querySelectorAll('[data-agent-type-chip]').forEach(chip => chip.addEventListener('click', event => {
    event.stopPropagation();
    agentFilterValues.type = chip.dataset.agentTypeChip || 'all';
    filterAgentCards();
  }));
  document.querySelectorAll('[data-agent-view-toggle]').forEach(button => button.addEventListener('click', () => {
    const list = button.dataset.agentViewToggle === 'list';
    const grid = document.querySelector('[data-agent-card-grid]');
    grid?.classList.toggle('xl:grid-cols-3', !list);
    grid?.classList.toggle('md:grid-cols-2', !list);
    grid?.classList.toggle('grid-cols-1', list);
    document.querySelectorAll('[data-agent-view-toggle]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('bg-card', selected);
      item.classList.toggle('text-primary', selected);
      item.classList.toggle('shadow-sm', selected);
    });
  }));
  document.querySelectorAll('[data-agent-card-menu-trigger]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const menu = button.parentElement?.querySelector('[data-agent-card-menu]');
    document.querySelectorAll('[data-agent-card-menu]').forEach(item => {
      const open = item === menu && item.getAttribute('aria-hidden') !== 'false';
      item.setAttribute('aria-hidden', open ? 'false' : 'true');
      item.classList.toggle('pointer-events-none', !open);
      item.classList.toggle('opacity-0', !open);
      item.classList.toggle('translate-y-1', !open);
    });
  }));
  document.addEventListener('click', () => document.querySelectorAll('[data-agent-card-menu]').forEach(menu => {
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.add('pointer-events-none', 'opacity-0', 'translate-y-1');
  }));

  const menuRoot = document.querySelector('[data-user-menu]');
  const trigger = document.querySelector('#user-menu-trigger');
  const panel = document.querySelector('#user-menu-panel');
  const setMenu = open => {
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.classList.toggle('pointer-events-none', !open); panel.classList.toggle('opacity-0', !open); panel.classList.toggle('-translate-y-1', !open); panel.classList.toggle('opacity-100', open); panel.classList.toggle('translate-y-0', open);
  };
  trigger?.addEventListener('click', event => { event.stopPropagation(); setMenu(trigger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', event => { if (menuRoot && !menuRoot.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { setMenu(false); trigger?.focus(); } });
  // My Agents list/L3/L4 immersive editor linkage.
  const agentEditorShells = Array.from(document.querySelectorAll('[data-agent-editor-shell]'));
  const setAgentEditor = level => {
    agentEditorShells.forEach(shell => {
      const selected = shell.dataset.agentEditorShell === level;
      shell.classList.toggle('hidden', !selected);
      shell.classList.toggle('flex', selected);
      shell.classList.toggle('opacity-0', !selected);
      shell.setAttribute('aria-hidden', selected ? 'false' : 'true');
      if (selected) requestAnimationFrame(() => shell.classList.remove('opacity-0'));
    });
    document.body.classList.toggle('overflow-hidden', Boolean(level));
  };
  document.querySelectorAll('[data-agent-edit-level]').forEach(button => button.addEventListener('click', () => setAgentEditor(button.dataset.agentEditLevel || 'l3')));
  document.querySelectorAll('[data-agent-editor-back]').forEach(button => button.addEventListener('click', () => setAgentEditor('')));
  document.querySelectorAll('[data-agent-save]').forEach(button => button.addEventListener('click', () => { setAgentEditor(''); window.showMessage?.({ tone: 'success', text: '智能体配置已保存（原型演示）' }); }));

  const promptTemplates = {
    contract: { title: '合同审核智能体', text: '## 工作步骤\n- 描述智能体如何进行工作\n- 调用已添加的知识库和连接器\n\n## 输出\n- 列出核心风险与处理建议\n\n# 角色\n你是一名资深合同审查顾问。' },
    health: { title: '健康报告审查模板', text: '# 角色\n你是一名健康报告审查助手。\n\n## 任务\n识别指标异常、风险等级和建议复查事项。' },
    monthly: { title: '个人月报提示词', text: '# 任务\n汇总本月目标、完成事项、问题风险和下月计划。\n\n## 输出\n使用结构化月报格式。' },
    travel: { title: '上海导游', text: '# 角色\n你是一名熟悉上海的本地导游。\n\n## 任务\n根据时间、偏好和交通方式生成行程。' },
    'code-review': { title: '代码审查助手', text: '# 任务\n审查输入代码的正确性、安全性和可维护性。\n\n## 输出\n按风险等级列出问题、原因与修改建议。' },
    'intent-router': { title: '用户意图识别', text: '# 任务\n识别用户请求中的核心意图、关键实体和期望动作。\n\n## 输出\n返回意图名称、置信度和路由建议。' },
    'text-summary': { title: '长文摘要提炼', text: '# 任务\n阅读输入的长文本并提炼关键观点、核心论据和待办事项。\n\n## 输出\n使用分级列表呈现。' },
    'product-copy': { title: '产品卖点生成', text: '# 角色\n你是一名产品营销文案专家。\n\n## 任务\n根据产品信息生成结构化卖点、目标人群和推广文案。' },
    'custom-meeting': { title: '会议纪要整理', text: '# 任务\n整理会议讨论内容，提取关键决策、待办事项、负责人和截止时间。\n\n## 输出\n按议题、结论、待办三个部分结构化输出。' },
    'custom-retro': { title: '项目复盘助手', text: '# 角色\n你是一名项目复盘顾问。\n\n## 任务\n围绕目标、过程、结果、问题根因和改进计划完成项目复盘。' }
  };
  const promptTitle = document.querySelector('[data-prompt-title]');
  const promptPreview = document.querySelector('[data-prompt-preview]');
  const promptReturnNotice = document.querySelector('[data-prompt-library-return]');
  const promptLibraryPreview = document.querySelector('[data-prompt-library-preview]');
  const promptLibraryPreviewPanel = document.querySelector('[data-prompt-library-preview-panel]');
  const promptLibraryPreviewTitle = document.querySelector('[data-prompt-library-preview-title]');
  const promptLibraryPreviewText = document.querySelector('[data-prompt-library-preview-text]');
  const promptLibraryPreviewCopy = document.querySelector('[data-prompt-library-preview-copy]');
  const setPromptDrawer = open => {
    if (!promptLibraryPreview || !promptLibraryPreviewPanel) return;
    if (open) {
      promptLibraryPreview.classList.remove('hidden'); promptLibraryPreview.classList.add('flex');
      promptLibraryPreview.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => { promptLibraryPreview.classList.remove('opacity-0'); promptLibraryPreviewPanel.classList.remove('translate-x-3'); });
      return;
    }
    promptLibraryPreview.classList.add('opacity-0'); promptLibraryPreviewPanel.classList.add('translate-x-3');
    promptLibraryPreview.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    setTimeout(() => { if (promptLibraryPreview.getAttribute('aria-hidden') === 'true') { promptLibraryPreview.classList.add('hidden'); promptLibraryPreview.classList.remove('flex'); } }, 300);
  };
  let selectedPromptKey = 'contract';
  let promptReturnToAgent = false;
  const selectPromptTemplate = key => {
    const template = promptTemplates[key];
    if (!template) return;
    selectedPromptKey = key;
    document.querySelectorAll('[data-prompt-template]').forEach(item => {
      const selected = item.dataset.promptTemplate === key;
      item.classList.toggle('bg-muted', selected);
      item.classList.toggle('font-medium', selected);
      item.classList.toggle('border', !selected);
      item.classList.toggle('border-border', !selected);
    });
    if (promptTitle) promptTitle.textContent = template.title;
    if (promptPreview) {
      if ('value' in promptPreview) {
        promptPreview.value = template.text;
        promptPreview.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        promptPreview.textContent = template.text;
      }
    }
  };
  const returnToAgentPrompt = () => {
    const myAgentsNav = navItems.find(item => item.dataset.target === 'my-agents');
    activate(myAgentsNav, false);
    history.replaceState(null, '', '#my-agents');
    setAgentView('editor');
    agentEditorView?.querySelector('[data-tab-trigger="prompt"]')?.click();
    promptReturnToAgent = false;
    promptReturnNotice?.classList.add('hidden');
    promptReturnNotice?.classList.remove('flex');
    window.showMessage?.({ tone: 'success', text: '已返回智能体提示词配置' });
  };
  document.querySelectorAll('[data-prompt-template]').forEach(button => button.addEventListener('click', () => {
    selectPromptTemplate(button.dataset.promptTemplate);
  }));
  document.querySelector('[data-prompt-insert]')?.addEventListener('click', () => window.showMessage?.({ tone: 'success', text: '已应用提示词：' + (promptTitle?.textContent || '') }));
  document.querySelector('[data-open-prompt-library]')?.addEventListener('click', () => {
    promptReturnToAgent = true;
    promptReturnNotice?.classList.remove('hidden');
    promptReturnNotice?.classList.add('flex');
    const promptsNav = navItems.find(item => item.dataset.target === 'prompts');
    activate(promptsNav, false);
    history.replaceState(null, '', '#prompts');
  });
  document.querySelector('[data-prompt-library-back]')?.addEventListener('click', returnToAgentPrompt);
  document.querySelectorAll('[data-prompt-library-detail]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.promptLibraryDetail;
    const template = promptTemplates[key];
    if (!template) return;
    selectedPromptKey = key;
    if (promptLibraryPreviewTitle) promptLibraryPreviewTitle.textContent = template.title;
    if (promptLibraryPreviewText) promptLibraryPreviewText.textContent = template.text;
    setPromptDrawer(true);
  }));
  const copyPromptTemplate = async key => {
    const template = promptTemplates[key];
    if (!template) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(template.text);
      copied = true;
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = template.text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      copied = document.execCommand('copy');
      helper.remove();
    }
    window.showMessage?.({ tone: copied ? 'success' : 'warning', text: copied ? '已复制提示词：' + template.title : '复制失败，请在查看内容中手动复制' });
  };
  document.querySelectorAll('[data-prompt-library-copy]').forEach(button => button.addEventListener('click', () => copyPromptTemplate(button.dataset.promptLibraryCopy)));
  promptLibraryPreviewCopy?.addEventListener('click', () => copyPromptTemplate(selectedPromptKey));
  document.querySelector('[data-prompt-library-preview-close]')?.addEventListener('click', () => setPromptDrawer(false));
  promptLibraryPreview?.addEventListener('click', event => { if (event.target === promptLibraryPreview) setPromptDrawer(false); });

  const promptRows = [...document.querySelectorAll('[data-prompt-row]')];
  const promptResultCount = document.querySelector('[data-prompt-result-count]');
  const promptSearchInput = document.querySelector('[data-prompt-search]');
  let activePromptCategory = 'all';
  const filterPromptRows = () => {
    const query = (promptSearchInput?.value || '').trim().toLocaleLowerCase();
    let visibleCount = 0;
    promptRows.forEach(row => {
      const categoryMatch = activePromptCategory === 'all' || row.dataset.promptCategoryValue === activePromptCategory;
      const searchMatch = !query || (row.dataset.promptSearchText || '').toLocaleLowerCase().includes(query);
      row.hidden = !(categoryMatch && searchMatch);
      if (!row.hidden) visibleCount += 1;
    });
    if (promptResultCount) promptResultCount.textContent = '共 ' + visibleCount + ' 个模板';
  };
  document.querySelectorAll('[data-prompt-category]').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.promptCategory;
    activePromptCategory = category;
    document.querySelectorAll('[data-prompt-category]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('btn-primary', selected);
      item.classList.toggle('btn-outline', !selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    let visibleCount = 0;
    promptRows.forEach(row => {
      const visible = category === 'all' || row.dataset.promptCategoryValue === category;
      row.hidden = !visible;
      row.classList.toggle('hidden', !visible);
      if (visible) visibleCount += 1;
    });
    if (promptResultCount) promptResultCount.textContent = '共 ' + visibleCount + ' 个模板';
    filterPromptRows();
  }));
  promptSearchInput?.addEventListener('input', filterPromptRows);
  document.querySelector('[data-page-panel="prompts"] [data-message-text="搜索条件已重置"]')?.addEventListener('click', () => { if (promptSearchInput) promptSearchInput.value = ''; activePromptCategory = 'all'; filterPromptRows(); });

  const agentPromptModal = document.querySelector('[data-agent-prompt-modal]');
  const agentPromptModalPanel = document.querySelector('[data-agent-prompt-modal-panel]');
  const agentPromptModalLibrary = document.querySelector('[data-agent-prompt-modal-library]');
  const agentPromptModalCreate = document.querySelector('[data-agent-prompt-modal-create]');
  const agentPromptModalHeading = document.querySelector('[data-agent-prompt-modal-heading]');
  const agentPromptModalTitle = document.querySelector('[data-agent-prompt-modal-title]');
  const agentPromptModalPreview = document.querySelector('[data-agent-prompt-modal-preview]');
  let agentPromptModalItems = [...document.querySelectorAll('[data-agent-prompt-modal-item]')];
  const agentPromptList = document.querySelector('[data-agent-prompt-list]');
  const agentPromptSourceTabs = [...document.querySelectorAll('[data-agent-prompt-source-tab]')];
  const agentPromptFavorites = document.querySelector('[data-agent-prompt-favorites]');
  const agentPromptCategorySelect = document.querySelector('[data-agent-prompt-category-select]');
  const agentPromptSearch = document.querySelector('[data-agent-prompt-search]');
  const agentPromptEmpty = document.querySelector('[data-agent-prompt-empty]');
  let agentPromptSource = 'builtin';
  const setAgentPromptModalView = view => {
    const creating = view === 'create';
    agentPromptModalLibrary?.classList.toggle('hidden', creating);
    agentPromptModalLibrary?.classList.toggle('flex', !creating);
    agentPromptModalCreate?.classList.toggle('hidden', !creating);
    agentPromptModalCreate?.classList.toggle('flex', creating);
    if (agentPromptModalHeading) agentPromptModalHeading.textContent = creating ? '新建提示词模板' : '使用提示词模板';
  };
  const setAgentPromptModal = open => {
    if (!agentPromptModal || !agentPromptModalPanel) return;
    if (open) {
      setAgentPromptModalView('library');
      filterAgentPromptModalItems();
      agentPromptModal.classList.remove('hidden');
      agentPromptModal.classList.add('flex');
      agentPromptModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        agentPromptModal.classList.remove('opacity-0');
        agentPromptModalPanel.classList.remove('translate-y-1');
        agentPromptModal.querySelector('[data-agent-prompt-modal-close]')?.focus();
      });
    } else {
      agentPromptModal.classList.add('opacity-0');
      agentPromptModalPanel.classList.add('translate-y-1');
      agentPromptModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        agentPromptModal.classList.add('hidden');
        agentPromptModal.classList.remove('flex');
      }, 180);
    }
  };
  const selectAgentPromptModalItem = key => {
    const template = promptTemplates[key];
    if (!template) return;
    selectedPromptKey = key;
    agentPromptModalItems.forEach(item => {
      const selected = item.dataset.agentPromptModalItem === key;
      item.classList.toggle('border-primary', selected);
      item.classList.toggle('bg-muted', selected);
      item.classList.toggle('border-border', !selected);
    });
    if (agentPromptModalTitle) agentPromptModalTitle.textContent = template.title;
    if (agentPromptModalPreview) agentPromptModalPreview.textContent = template.text;
  };
  const filterAgentPromptModalItems = () => {
    const category = agentPromptCategorySelect?.value || 'all';
    const query = (agentPromptSearch?.value || '').trim().toLocaleLowerCase();
    const favoritesOnly = Boolean(agentPromptFavorites?.checked);
    let firstVisible = null;
    let selectedVisible = false;
    agentPromptModalItems.forEach(item => {
      const sourceMatches = item.dataset.agentPromptSource === agentPromptSource;
      const categoryMatches = category === 'all' || item.dataset.agentPromptModalItemCategory === category;
      const favoriteMatches = !favoritesOnly || item.dataset.agentPromptFavorite === 'true';
      const searchMatches = !query || (item.dataset.agentPromptSearchText || '').toLocaleLowerCase().includes(query);
      const visible = sourceMatches && categoryMatches && favoriteMatches && searchMatches;
      item.hidden = !visible;
      item.classList.toggle('hidden', !visible);
      if (visible && !firstVisible) firstVisible = item;
      if (visible && item.dataset.agentPromptModalItem === selectedPromptKey) selectedVisible = true;
    });
    agentPromptEmpty?.classList.toggle('hidden', Boolean(firstVisible));
    if (!selectedVisible && firstVisible) selectAgentPromptModalItem(firstVisible.dataset.agentPromptModalItem);
    if (!firstVisible) {
      if (agentPromptModalTitle) agentPromptModalTitle.textContent = '暂无可预览模板';
      if (agentPromptModalPreview) agentPromptModalPreview.textContent = '请调整模板来源、收藏、模板分类或搜索条件。';
    }
  };
  document.querySelector('[data-agent-prompt-library-open]')?.addEventListener('click', () => {
    selectAgentPromptModalItem(selectedPromptKey);
    setAgentPromptModal(true);
  });
  document.querySelectorAll('[data-agent-prompt-modal-close]').forEach(button => button.addEventListener('click', () => setAgentPromptModal(false)));
  agentPromptModal?.addEventListener('click', event => { if (event.target === agentPromptModal) setAgentPromptModal(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && agentPromptModal?.getAttribute('aria-hidden') === 'false') setAgentPromptModal(false); });
  agentPromptModalItems.forEach(item => item.addEventListener('click', () => selectAgentPromptModalItem(item.dataset.agentPromptModalItem)));
  agentPromptSourceTabs.forEach(button => button.addEventListener('click', () => {
    agentPromptSource = button.dataset.agentPromptSourceTab || 'builtin';
    agentPromptSourceTabs.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    filterAgentPromptModalItems();
  }));
  agentPromptFavorites?.addEventListener('change', filterAgentPromptModalItems);
  agentPromptCategorySelect?.addEventListener('change', filterAgentPromptModalItems);
  agentPromptSearch?.addEventListener('input', filterAgentPromptModalItems);
  document.querySelector('[data-agent-prompt-modal-copy]')?.addEventListener('click', () => copyPromptTemplate(selectedPromptKey));
  document.querySelector('[data-agent-prompt-modal-insert]')?.addEventListener('click', () => {
    selectPromptTemplate(selectedPromptKey);
    const source = document.querySelector('[data-agent-prompt-source]');
    if (source) source.textContent = '已引用模板';
    setAgentPromptModal(false);
    window.showMessage?.({ tone: 'success', text: '已插入提示词模板：' + (promptTemplates[selectedPromptKey]?.title || '') });
  });
  document.querySelector('[data-agent-prompt-create-open]')?.addEventListener('click', () => setAgentPromptModalView('create'));
  document.querySelector('[data-agent-prompt-create-back]')?.addEventListener('click', () => setAgentPromptModalView('library'));
  document.querySelector('[data-agent-prompt-create-save]')?.addEventListener('click', () => {
    const name = document.querySelector('[data-agent-prompt-create-name]')?.value.trim();
    const description = document.querySelector('[data-agent-prompt-create-description]')?.value.trim();
    const category = document.querySelector('[data-agent-prompt-create-category]')?.value;
    const text = document.querySelector('[data-agent-prompt-create-text]')?.value.trim();
    if (!name || !category || !text) {
      window.showMessage?.({ tone: 'warning', text: '请填写模板名称、模板分类和提示词' });
      return;
    }
    const categoryMap = { 推荐: 'recommended', 科技范: 'tech', 意图识别: 'intent', 文本理解: 'understanding', 文本创作: 'writing', 办公效率: 'office', 专业问答: 'professional' };
    const key = 'custom-' + Date.now();
    promptTemplates[key] = { title: name, text };
    if (agentPromptList) {
      const item = document.createElement('button');
      item.className = 'w-full rounded-lg border border-border px-4 py-3 text-left transition duration-150 hover:bg-muted/50';
      item.type = 'button';
      item.dataset.agentPromptModalItem = key;
      item.dataset.agentPromptModalItemCategory = categoryMap[category] || 'professional';
      item.dataset.agentPromptSource = 'custom';
      item.dataset.agentPromptFavorite = 'false';
      item.dataset.agentPromptSearchText = name + ' ' + (description || '');
      item.innerHTML = '<span class="flex items-center justify-between gap-3"><strong class="truncate text-sm"></strong><span class="text-xs text-muted-foreground"></span></span><span class="mt-1 block truncate text-xs text-muted-foreground"></span>';
      item.querySelector('strong').textContent = name;
      item.querySelectorAll('span.text-xs')[0].textContent = category;
      item.querySelectorAll('span.text-xs')[1].textContent = description || '自定义提示词模板';
      item.addEventListener('click', () => selectAgentPromptModalItem(key));
      agentPromptList.insertBefore(item, agentPromptEmpty);
      agentPromptModalItems = [...document.querySelectorAll('[data-agent-prompt-modal-item]')];
    }
    selectedPromptKey = key;
    agentPromptSource = 'custom';
    agentPromptSourceTabs.forEach(item => {
      const selected = item.dataset.agentPromptSourceTab === 'custom';
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    selectPromptTemplate(key);
    const source = document.querySelector('[data-agent-prompt-source]');
    if (source) source.textContent = '自建模板';
    setAgentPromptModal(false);
    window.showMessage?.({ tone: 'success', text: '提示词模板已新建并插入当前智能体' });
  });

  const widgetTemplates = {
    confirm: { title: '操作确认提示', category: '确认选择', description: '在执行关键操作前展示摘要并等待用户确认。', heading: '确认执行当前操作？', copy: '请核对操作内容，确认后继续执行。' },
    single: { title: '单选澄清', category: '信息收集', description: '展示候选项，帮助用户快速补充一个关键条件。', heading: '请选择一个方案', copy: '选择最符合当前需求的选项。' },
    form: { title: '基础信息表单', category: '信息收集', description: '通过文本、日期和下拉项收集结构化信息。', heading: '补充基础信息', copy: '请填写以下信息后继续。' },
    upload: { title: '文件提交', category: '文件提交', description: '引导用户上传任务需要的文件或图片。', heading: '上传任务文件', copy: '支持文档、图片等常用格式。' },
    result: { title: '结果摘要卡', category: '内容展示', description: '以摘要、状态和操作按钮展示任务结果。', heading: '任务已完成', copy: '已生成 3 项结果，可继续查看详情。' },
    address: { title: '地址选择', category: '信息收集', description: '让用户从候选地址中选择或补充新地址。', heading: '选择地址', copy: '选择一个候选地址或补充新地址。' }
  };
  const widgetTitle = document.querySelector('[data-widget-title]');
  const widgetDescription = document.querySelector('[data-widget-description]');
  const widgetHeading = document.querySelector('[data-widget-preview-heading]');
  const widgetPreviewCopy = document.querySelector('[data-agent-widget-preview-copy]');
  const widgetCategory = document.querySelector('[data-agent-widget-category]');
  const widgetPreview = document.querySelector('[data-agent-widget-preview]');
  const widgetSource = document.querySelector('[data-agent-widget-source]');
  let appliedWidgetKey = 'confirm';
  let selectedWidgetKey = appliedWidgetKey;
  const widgetPreviewMarkup = key => {
    if (key === 'single') return '<p class="text-sm font-semibold" data-widget-preview-heading>请选择一个方案</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>选择最符合当前需求的选项。</p><div class="mt-4 space-y-2 text-left"><label class="radio-wrapper"><input class="radio" type="radio" name="agent-widget-choice"><span class="radio-label">方案 A</span></label><label class="radio-wrapper"><input class="radio" type="radio" name="agent-widget-choice"><span class="radio-label">方案 B</span></label></div>';
    if (key === 'form') return '<p class="text-sm font-semibold" data-widget-preview-heading>补充基础信息</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>请填写以下信息后继续。</p><div class="mt-4 space-y-2 text-left"><input class="input input--default" type="text" placeholder="请输入名称"><input class="input input--default" type="text" placeholder="请选择日期"><button class="btn btn-primary btn-sm w-full" type="button">提交</button></div>';
    if (key === 'upload') return '<i data-lucide="upload-cloud" class="mx-auto h-8 w-8 text-primary"></i><p class="mt-3 text-sm font-semibold" data-widget-preview-heading>上传任务文件</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>支持文档、图片等常用格式。</p><button class="btn btn-outline btn-sm mt-4" type="button">选择文件</button>';
    if (key === 'result') return '<span class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary"><i data-lucide="check" class="h-5 w-5"></i></span><p class="mt-3 text-sm font-semibold" data-widget-preview-heading>任务已完成</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>已生成 3 项结果，可继续查看详情。</p><div class="mt-4 h-2 rounded bg-muted"><div class="h-2 w-full rounded bg-primary"></div></div><button class="btn btn-outline btn-sm mt-4" type="button">查看详情</button>';
    if (key === 'address') return '<p class="text-sm font-semibold" data-widget-preview-heading>选择地址</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>选择一个候选地址或补充新地址。</p><div class="mt-4 space-y-2 text-left"><button class="w-full rounded-lg border border-primary bg-muted px-3 py-2 text-left text-xs" type="button">北京市朝阳区</button><button class="w-full rounded-lg border border-border px-3 py-2 text-left text-xs" type="button">上海市浦东新区</button></div>';
    return '<span class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary"><i data-lucide="check" class="h-5 w-5"></i></span><p class="mt-3 text-sm font-semibold" data-widget-preview-heading>确认执行当前操作？</p><p class="mt-1 text-xs text-muted-foreground" data-agent-widget-preview-copy>请核对操作内容，确认后继续执行。</p><div class="mt-5 grid grid-cols-2 gap-2"><button class="btn btn-primary btn-sm" type="button">确认</button><button class="btn btn-outline btn-sm" type="button">取消</button></div>';
  };
  const widgetPreviewModal = document.querySelector('[data-widget-preview-modal]');
  const widgetPreviewPanel = document.querySelector('[data-widget-preview-panel]');
  const widgetPreviewModalTitle = document.querySelector('[data-widget-preview-modal-title]');
  const widgetPreviewModalBody = document.querySelector('[data-widget-preview-modal-body]');
  let activeWidgetPreviewKey = 'confirm';
  const setWidgetPreviewModal = (open, key = activeWidgetPreviewKey) => {
    if (!widgetPreviewModal || !widgetPreviewPanel) return;
    if (open) {
      activeWidgetPreviewKey = key || 'confirm';
      const template = widgetTemplates[activeWidgetPreviewKey] || widgetTemplates.confirm;
      if (widgetPreviewModalTitle) widgetPreviewModalTitle.textContent = template.title;
      if (widgetPreviewModalBody) {
        widgetPreviewModalBody.innerHTML = '<div class="w-full max-w-sm text-center">' + widgetPreviewMarkup(activeWidgetPreviewKey) + '</div>';
        window.lucide?.createIcons();
      }
      widgetPreviewModal.classList.remove('hidden');
      widgetPreviewModal.classList.add('flex');
      widgetPreviewModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        widgetPreviewModal.classList.remove('opacity-0');
        widgetPreviewPanel.classList.remove('translate-y-1');
        widgetPreviewModal.querySelector('[data-widget-preview-modal-close]')?.focus();
      });
    } else {
      widgetPreviewModal.classList.add('opacity-0');
      widgetPreviewPanel.classList.add('translate-y-1');
      widgetPreviewModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        widgetPreviewModal.classList.add('hidden');
        widgetPreviewModal.classList.remove('flex');
      }, 180);
    }
  };
  const applyWidgetTemplate = key => {
    const template = widgetTemplates[key];
    if (!template) return;
    appliedWidgetKey = key;
    selectedWidgetKey = key;
    if (widgetTitle) widgetTitle.textContent = template.title;
    if (widgetDescription) widgetDescription.textContent = template.description;
    if (widgetHeading) widgetHeading.textContent = template.heading;
    if (widgetPreviewCopy) widgetPreviewCopy.textContent = template.copy;
    if (widgetCategory) widgetCategory.textContent = template.category;
    if (widgetPreview) {
      widgetPreview.innerHTML = widgetPreviewMarkup(key);
      window.lucide?.createIcons();
    }
    if (widgetSource) widgetSource.textContent = '已引用模板';
  };

  const widgetResourceCards = [...document.querySelectorAll('[data-widget-resource-card]')];
  const widgetResourceSearch = document.querySelector('[data-widget-resource-search-input]');
  const widgetResourceSort = document.querySelector('[data-widget-resource-sort]');
  const widgetResourceCount = document.querySelector('[data-widget-resource-count]');
  const widgetResourceGrid = widgetResourceCards[0]?.parentElement;
  let widgetResourceCategory = 'all';
  const getWidgetResourceDate = card => {
    const dateText = [...card.querySelectorAll('p')]
      .map(node => node.textContent.trim())
      .find(text => text.startsWith('最近更新：'));
    return Date.parse(dateText?.replace('最近更新：', '') || '') || 0;
  };
  const sortWidgetResources = order => {
    if (!widgetResourceGrid) return;
    [...widgetResourceCards]
      .sort((left, right) => {
        const difference = getWidgetResourceDate(right) - getWidgetResourceDate(left);
        return order === 'oldest' ? -difference : difference;
      })
      .forEach(card => widgetResourceGrid.appendChild(card));
  };
  const filterWidgetResources = () => {
    const query = (widgetResourceSearch?.value || '').trim().toLocaleLowerCase();
    let visibleCount = 0;
    widgetResourceCards.forEach(card => {
      const categoryMatches = widgetResourceCategory === 'all' || card.dataset.widgetResourceCategory === widgetResourceCategory;
      const searchMatches = !query || (card.dataset.widgetResourceSearch || '').toLocaleLowerCase().includes(query);
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      card.classList.toggle('hidden', !visible);
      if (visible) visibleCount += 1;
    });
    if (widgetResourceCount) widgetResourceCount.textContent = '共 ' + visibleCount + ' 个模板';
  };
  document.querySelectorAll('[data-widget-resource-filter]').forEach(button => button.addEventListener('click', () => {
    widgetResourceCategory = button.dataset.widgetResourceFilter || 'all';
    document.querySelectorAll('[data-widget-resource-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('btn-primary', selected);
      item.classList.toggle('btn-outline', !selected);
    });
    filterWidgetResources();
  }));
  widgetResourceSearch?.addEventListener('input', filterWidgetResources);
  widgetResourceSort?.querySelectorAll('[data-widget-resource-sort-value]').forEach(option => {
    option.addEventListener('click', () => sortWidgetResources(option.dataset.widgetResourceSortValue));
  });

  const widgetBuilderModal = document.querySelector('[data-widget-builder-modal]');
  const widgetBuilderPanel = document.querySelector('[data-widget-builder-panel]');
  const widgetBuilderNameInput = document.querySelector('[data-widget-builder-name-input]');
  const widgetBuilderCanvas = document.querySelector('[data-widget-builder-canvas]');
  const widgetBuilderComponentTitle = document.querySelector('[data-widget-builder-component-title]');
  const widgetBuilderComponents = {
    single: { title: '单选组件', markup: '<p class="text-sm font-medium"><span class="text-primary">*</span> 请选择一个方案</p><div class="mt-4 grid gap-3 sm:grid-cols-2"><label class="radio-wrapper rounded-lg border border-primary bg-muted p-3"><input class="radio" type="radio" name="widget-builder-choice" checked><span class="radio-label">方案 A</span></label><label class="radio-wrapper rounded-lg border border-border p-3"><input class="radio" type="radio" name="widget-builder-choice"><span class="radio-label">方案 B</span></label></div>' },
    multiple: { title: '多选组件', markup: '<p class="text-sm font-medium"><span class="text-primary">*</span> 请选择需要的能力</p><div class="mt-4 grid gap-3 sm:grid-cols-2"><label class="checkbox-wrapper rounded-lg border border-primary bg-muted p-3"><input class="checkbox" type="checkbox" checked><span class="checkbox-label">知识检索</span></label><label class="checkbox-wrapper rounded-lg border border-border p-3"><input class="checkbox" type="checkbox"><span class="checkbox-label">数据分析</span></label></div>' },
    toggle: { title: '开关组件', markup: '<div class="flex items-center justify-between rounded-lg border border-border p-4"><div><p class="text-sm font-medium">开启结果通知</p><p class="mt-1 text-xs text-muted-foreground">任务完成后向用户发送提醒</p></div><label class="switch-wrapper"><input class="switch-input" type="checkbox" checked><span class="switch-track"><span class="switch-thumb"></span></span></label></div>' },
    date: { title: '日期选择器', markup: '<label class="text-sm font-medium"><span class="text-primary">*</span> 选择计划日期</label><div class="input-group mt-3"><div class="input-shell input-shell--default"><span class="input-icon"><i data-lucide="calendar-days"></i></span><input class="input-field" type="text" value="2026-09-03" readonly></div></div>' },
    address: { title: '地址选择器', markup: '<p class="text-sm font-medium"><span class="text-primary">*</span> 请选择地址</p><div class="mt-3 space-y-2"><button class="w-full rounded-lg border border-primary bg-muted px-3 py-2 text-left text-sm" type="button">北京市朝阳区</button><button class="w-full rounded-lg border border-border px-3 py-2 text-left text-sm" type="button">上海市浦东新区</button></div>' },
    list: { title: '文本列表', markup: '<p class="text-sm font-medium">处理结果</p><div class="mt-3 divide-y divide-border rounded-lg border border-border"><p class="p-3 text-sm">1. 已完成信息校验</p><p class="p-3 text-sm">2. 已生成处理建议</p><p class="p-3 text-sm">3. 等待用户确认</p></div>' },
    text: { title: '文本输入', markup: '<label class="text-sm font-medium"><span class="text-primary">*</span> 补充说明</label><textarea class="input input--default mt-3 min-h-28" placeholder="请输入补充说明"></textarea>' },
    image: { title: '图片上传', markup: '<div class="rounded-lg border border-dashed border-input p-8 text-center"><i data-lucide="image-up" class="mx-auto h-7 w-7 text-primary"></i><p class="mt-3 text-sm font-medium">上传图片</p><p class="mt-1 text-xs text-muted-foreground">支持 PNG、JPG</p><button class="btn btn-outline btn-sm mt-4" type="button">选择图片</button></div>' },
    file: { title: '文件上传', markup: '<div class="rounded-lg border border-dashed border-input p-8 text-center"><i data-lucide="upload-cloud" class="mx-auto h-7 w-7 text-primary"></i><p class="mt-3 text-sm font-medium">上传任务文件</p><p class="mt-1 text-xs text-muted-foreground">支持文档、表格和压缩包</p><button class="btn btn-outline btn-sm mt-4" type="button">选择文件</button></div>' },
    select: { title: '下拉选择', markup: '<label class="text-sm font-medium"><span class="text-primary">*</span> 选择处理方式</label><select class="input input--default mt-3"><option>自动处理</option><option>人工确认</option><option>稍后处理</option></select>' }
  };
  const renderWidgetBuilderComponent = key => {
    const component = widgetBuilderComponents[key];
    if (!component || !widgetBuilderCanvas) return;
    widgetBuilderCanvas.innerHTML = '<div class="flex items-center justify-between"><div><p class="text-xs text-muted-foreground">当前组件</p><h3 class="mt-1 font-semibold" data-widget-builder-component-title>' + component.title + '</h3></div><span class="tag tag--outline tag--primary">必填</span></div><div class="mt-6 border-t border-border pt-6">' + component.markup + '</div>';
    window.lucide?.createIcons();
  };
  const setWidgetBuilderModal = (open, name = '') => {
    if (!widgetBuilderModal || !widgetBuilderPanel) return;
    if (open) {
      if (widgetBuilderNameInput) widgetBuilderNameInput.value = name || '未命名 Widget';
      widgetBuilderModal.classList.remove('hidden');
      widgetBuilderModal.classList.add('flex');
      widgetBuilderModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        widgetBuilderModal.classList.remove('opacity-0');
        widgetBuilderPanel.classList.remove('translate-y-1');
        widgetBuilderModal.querySelector('[data-widget-builder-close]')?.focus();
      });
    } else {
      widgetBuilderModal.classList.add('opacity-0');
      widgetBuilderPanel.classList.add('translate-y-1');
      widgetBuilderModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        widgetBuilderModal.classList.add('hidden');
        widgetBuilderModal.classList.remove('flex');
      }, 180);
    }
  };
  document.querySelectorAll('[data-widget-builder-open]').forEach(button => button.addEventListener('click', () => setWidgetBuilderModal(true, button.dataset.widgetBuilderName)));
  document.querySelectorAll('[data-widget-builder-close]').forEach(button => button.addEventListener('click', () => setWidgetBuilderModal(false)));
  widgetBuilderModal?.addEventListener('click', event => { if (event.target === widgetBuilderModal) setWidgetBuilderModal(false); });
  document.querySelectorAll('[data-widget-preview-open]').forEach(button => button.addEventListener('click', () => setWidgetPreviewModal(true, button.dataset.widgetPreviewKey)));
  document.querySelectorAll('[data-widget-preview-modal-close]').forEach(button => button.addEventListener('click', () => setWidgetPreviewModal(false)));
  widgetPreviewModal?.addEventListener('click', event => { if (event.target === widgetPreviewModal) setWidgetPreviewModal(false); });
  document.querySelector('[data-widget-preview-modal-edit]')?.addEventListener('click', () => {
    const name = widgetTemplates[activeWidgetPreviewKey]?.title || '未命名 Widget';
    setWidgetPreviewModal(false);
    setTimeout(() => setWidgetBuilderModal(true, name), 190);
  });
  document.querySelectorAll('[data-widget-builder-component]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-widget-builder-component]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('border-primary', selected);
      item.classList.toggle('bg-muted', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    renderWidgetBuilderComponent(button.dataset.widgetBuilderComponent);
  }));
  document.querySelector('[data-widget-builder-save]')?.addEventListener('click', () => {
    const name = widgetBuilderNameInput?.value.trim() || '未命名 Widget';
    setWidgetBuilderModal(false);
    window.showMessage?.({ tone: 'success', text: 'Widget 已保存：' + name });
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && widgetBuilderModal?.getAttribute('aria-hidden') === 'false') setWidgetBuilderModal(false); if (event.key === 'Escape' && widgetPreviewModal?.getAttribute('aria-hidden') === 'false') setWidgetPreviewModal(false); if (event.key === 'Escape' && promptLibraryPreview?.getAttribute('aria-hidden') === 'false') setPromptDrawer(false); });

  const agentWidgetBuilderModal = document.querySelector('[data-agent-widget-builder-modal]');
  const agentWidgetBuilderPanel = document.querySelector('[data-agent-widget-builder-panel]');
  const agentWidgetBuilderName = document.querySelector('[data-agent-widget-builder-name]');
  const agentWidgetBuilderCanvas = document.querySelector('[data-agent-widget-builder-canvas]');
  let agentWidgetBuilderComponentKey = 'single';
  const renderAgentWidgetBuilderComponent = key => {
    const component = widgetBuilderComponents[key];
    if (!component || !agentWidgetBuilderCanvas) return;
    agentWidgetBuilderComponentKey = key;
    agentWidgetBuilderCanvas.innerHTML = '<div class="flex items-center justify-between"><div><p class="text-xs text-muted-foreground">当前组件</p><h3 class="mt-1 font-semibold" data-agent-widget-builder-component-title>' + component.title + '</h3></div><span class="tag tag--outline tag--primary">必填</span></div><div class="mt-6 border-t border-border pt-6">' + component.markup + '</div>';
    window.lucide?.createIcons();
  };
  const setAgentWidgetBuilderModal = open => {
    if (!agentWidgetBuilderModal || !agentWidgetBuilderPanel) return;
    if (open) {
      agentWidgetBuilderModal.classList.remove('hidden');
      agentWidgetBuilderModal.classList.add('flex');
      agentWidgetBuilderModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        agentWidgetBuilderModal.classList.remove('opacity-0');
        agentWidgetBuilderPanel.classList.remove('translate-y-1');
        agentWidgetBuilderModal.querySelector('[data-agent-widget-builder-close]')?.focus();
      });
    } else {
      agentWidgetBuilderModal.classList.add('opacity-0');
      agentWidgetBuilderPanel.classList.add('translate-y-1');
      agentWidgetBuilderModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        agentWidgetBuilderModal.classList.add('hidden');
        agentWidgetBuilderModal.classList.remove('flex');
      }, 180);
    }
  };
  document.querySelectorAll('[data-agent-widget-builder-open]').forEach(button => button.addEventListener('click', () => setAgentWidgetBuilderModal(true)));
  document.querySelectorAll('[data-agent-widget-builder-close]').forEach(button => button.addEventListener('click', () => setAgentWidgetBuilderModal(false)));
  agentWidgetBuilderModal?.addEventListener('click', event => { if (event.target === agentWidgetBuilderModal) setAgentWidgetBuilderModal(false); });
  document.querySelectorAll('[data-agent-widget-builder-component]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-agent-widget-builder-component]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('border-primary', selected);
      item.classList.toggle('bg-muted', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    renderAgentWidgetBuilderComponent(button.dataset.agentWidgetBuilderComponent);
  }));
  const agentBuilderTemplateMap = { story: 'text', ratio: 'single', audio: 'multiple' };
  document.querySelectorAll('[data-agent-widget-builder-template]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-agent-widget-builder-template]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('border-primary', selected);
      item.classList.toggle('bg-muted', selected);
      item.classList.toggle('border-border', !selected);
    });
    renderAgentWidgetBuilderComponent(agentBuilderTemplateMap[button.dataset.agentWidgetBuilderTemplate] || 'single');
  }));

  const agentWidgetSaveTemplateModal = document.querySelector('[data-agent-widget-save-template-modal]');
  const agentWidgetSaveTemplatePanel = document.querySelector('[data-agent-widget-save-template-panel]');
  const agentWidgetTemplateName = document.querySelector('[data-agent-widget-template-name]');
  const agentWidgetTemplateDescription = document.querySelector('[data-agent-widget-template-description]');
  const agentWidgetTemplateCategory = document.querySelector('[data-agent-widget-template-category]');
  const setAgentWidgetSaveTemplateModal = open => {
    if (!agentWidgetSaveTemplateModal || !agentWidgetSaveTemplatePanel) return;
    if (open) {
      if (agentWidgetTemplateName && agentWidgetBuilderName) agentWidgetTemplateName.value = agentWidgetBuilderName.value || '自定义界面 1';
      agentWidgetSaveTemplateModal.classList.remove('hidden');
      agentWidgetSaveTemplateModal.classList.add('flex');
      agentWidgetSaveTemplateModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        agentWidgetSaveTemplateModal.classList.remove('opacity-0');
        agentWidgetSaveTemplatePanel.classList.remove('translate-y-1');
        agentWidgetTemplateName?.focus();
      });
    } else {
      agentWidgetSaveTemplateModal.classList.add('opacity-0');
      agentWidgetSaveTemplatePanel.classList.add('translate-y-1');
      agentWidgetSaveTemplateModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = agentWidgetBuilderModal?.getAttribute('aria-hidden') === 'false' ? 'hidden' : '';
      setTimeout(() => {
        agentWidgetSaveTemplateModal.classList.add('hidden');
        agentWidgetSaveTemplateModal.classList.remove('flex');
      }, 180);
    }
  };
  document.querySelector('[data-agent-widget-save-template-open]')?.addEventListener('click', () => setAgentWidgetSaveTemplateModal(true));
  document.querySelectorAll('[data-agent-widget-save-template-close]').forEach(button => button.addEventListener('click', () => setAgentWidgetSaveTemplateModal(false)));
  agentWidgetSaveTemplateModal?.addEventListener('click', event => { if (event.target === agentWidgetSaveTemplateModal) setAgentWidgetSaveTemplateModal(false); });
  document.querySelector('[data-agent-widget-save-template-confirm]')?.addEventListener('click', () => {
    const templateName = agentWidgetTemplateName?.value.trim();
    if (!templateName) {
      window.showMessage?.({ tone: 'warning', text: '请填写 Widget 模板名称' });
      agentWidgetTemplateName?.focus();
      return;
    }
    const description = agentWidgetTemplateDescription?.value.trim() || '用于智能体对话中的自定义交互界面。';
    const category = agentWidgetTemplateCategory?.value || '信息收集';
    setAgentWidgetSaveTemplateModal(false);
    window.showMessage?.({ tone: 'success', text: 'Widget 模板已保存：' + templateName + ' · ' + category });
    if (agentWidgetBuilderName) agentWidgetBuilderName.value = templateName;
    if (widgetDescription) widgetDescription.dataset.savedTemplateDescription = description;
  });
  document.querySelector('[data-agent-widget-builder-apply]')?.addEventListener('click', () => {
    const name = agentWidgetBuilderName?.value.trim() || '自定义界面 1';
    const component = widgetBuilderComponents[agentWidgetBuilderComponentKey] || widgetBuilderComponents.single;
    if (widgetTitle) widgetTitle.textContent = name;
    if (widgetDescription) widgetDescription.textContent = widgetDescription.dataset.savedTemplateDescription || '通过低代码搭建的自定义交互界面。';
    if (widgetCategory) widgetCategory.textContent = '自定义搭建';
    if (widgetSource) widgetSource.textContent = '低代码自建';
    if (widgetPreview) {
      widgetPreview.innerHTML = '<div class="text-left"><p class="mb-4 text-sm font-semibold">' + name + '</p>' + component.markup + '</div>';
      window.lucide?.createIcons();
    }
    setAgentWidgetBuilderModal(false);
    window.showMessage?.({ tone: 'success', text: '已创建并使用自定义 Widget：' + name });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (agentWidgetSaveTemplateModal?.getAttribute('aria-hidden') === 'false') setAgentWidgetSaveTemplateModal(false);
    else if (agentWidgetBuilderModal?.getAttribute('aria-hidden') === 'false') setAgentWidgetBuilderModal(false);
  });

  const agentWidgetModal = document.querySelector('[data-agent-widget-modal]');
  const agentWidgetModalPanel = document.querySelector('[data-agent-widget-modal-panel]');
  const agentWidgetModalItems = [...document.querySelectorAll('[data-agent-widget-modal-item]')];
  const agentWidgetModalSearch = document.querySelector('[data-agent-widget-modal-search]');
  const agentWidgetModalEmpty = document.querySelector('[data-agent-widget-modal-empty]');
  const agentWidgetModalCount = document.querySelector('[data-agent-widget-modal-count]');
  let agentWidgetModalCategory = 'all';
  const selectAgentWidgetModalItem = key => {
    if (!widgetTemplates[key]) return;
    selectedWidgetKey = key;
    agentWidgetModalItems.forEach(item => {
      const selected = item.dataset.agentWidgetModalItem === key;
      item.classList.toggle('border-primary', selected);
      item.classList.toggle('shadow-sm', selected);
      item.classList.toggle('border-border', !selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const indicator = item.querySelector('[data-agent-widget-select-indicator]');
      if (indicator) {
        indicator.classList.toggle('bg-primary', selected);
        indicator.classList.toggle('text-primary-foreground', selected);
        indicator.classList.toggle('border-primary', selected);
        indicator.classList.toggle('border-input', !selected);
        indicator.innerHTML = selected ? '<i data-lucide="check" class="h-3 w-3"></i>' : '';
      }
    });
    window.lucide?.createIcons();
  };
  const filterAgentWidgetModalItems = () => {
    const query = (agentWidgetModalSearch?.value || '').trim().toLocaleLowerCase();
    let visibleCount = 0;
    let firstVisible = null;
    let selectedVisible = false;
    agentWidgetModalItems.forEach(item => {
      const categoryMatches = agentWidgetModalCategory === 'all' || item.dataset.agentWidgetModalCategory === agentWidgetModalCategory;
      const searchMatches = !query || (item.dataset.agentWidgetModalSearchText || '').toLocaleLowerCase().includes(query);
      const visible = categoryMatches && searchMatches;
      item.hidden = !visible;
      item.classList.toggle('hidden', !visible);
      if (visible && !firstVisible) firstVisible = item;
      if (visible && item.dataset.agentWidgetModalItem === selectedWidgetKey) selectedVisible = true;
      if (visible) visibleCount += 1;
    });
    agentWidgetModalEmpty?.classList.toggle('hidden', visibleCount > 0);
    if (agentWidgetModalCount) agentWidgetModalCount.textContent = '共 ' + visibleCount + ' 个模板';
    if (!selectedVisible && firstVisible) selectAgentWidgetModalItem(firstVisible.dataset.agentWidgetModalItem);
  };
  const setAgentWidgetModal = open => {
    if (!agentWidgetModal || !agentWidgetModalPanel) return;
    if (open) {
      selectedWidgetKey = appliedWidgetKey;
      filterAgentWidgetModalItems();
      selectAgentWidgetModalItem(selectedWidgetKey);
      agentWidgetModal.classList.remove('hidden');
      agentWidgetModal.classList.add('flex');
      agentWidgetModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        agentWidgetModal.classList.remove('opacity-0');
        agentWidgetModalPanel.classList.remove('translate-y-1');
        agentWidgetModal.querySelector('[data-agent-widget-modal-close]')?.focus();
      });
    } else {
      agentWidgetModal.classList.add('opacity-0');
      agentWidgetModalPanel.classList.add('translate-y-1');
      agentWidgetModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        agentWidgetModal.classList.add('hidden');
        agentWidgetModal.classList.remove('flex');
      }, 180);
    }
  };
  document.querySelectorAll('[data-agent-widget-library-open]').forEach(button => button.addEventListener('click', () => setAgentWidgetModal(true)));
  document.querySelectorAll('[data-agent-widget-modal-close]').forEach(button => button.addEventListener('click', () => setAgentWidgetModal(false)));
  agentWidgetModal?.addEventListener('click', event => { if (event.target === agentWidgetModal) setAgentWidgetModal(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && agentWidgetModal?.getAttribute('aria-hidden') === 'false') setAgentWidgetModal(false); });
  agentWidgetModalItems.forEach(item => item.addEventListener('click', () => selectAgentWidgetModalItem(item.dataset.agentWidgetModalItem)));
  document.querySelectorAll('[data-agent-widget-modal-filter]').forEach(button => button.addEventListener('click', () => {
    agentWidgetModalCategory = button.dataset.agentWidgetModalFilter || 'all';
    document.querySelectorAll('[data-agent-widget-modal-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('btn-primary', selected);
      item.classList.toggle('btn-outline', !selected);
    });
    filterAgentWidgetModalItems();
  }));
  agentWidgetModalSearch?.addEventListener('input', filterAgentWidgetModalItems);
  document.querySelector('[data-agent-widget-modal-confirm]')?.addEventListener('click', () => {
    applyWidgetTemplate(selectedWidgetKey);
    setAgentWidgetModal(false);
    window.showMessage?.({ tone: 'success', text: '已引用 Widget 模板：' + (widgetTemplates[selectedWidgetKey]?.title || '') });
  });
  document.querySelector('[data-widget-use]')?.addEventListener('click', () => window.showMessage?.({ tone: 'success', text: '已确认使用 Widget：' + (widgetTitle?.textContent || '') }));

  const compactAgentCard = document.querySelector('[data-agent-search-text^="日报总结助手"]');
  const compactAgentDescription = compactAgentCard?.querySelector('p.line-clamp-2');
  if (compactAgentDescription) compactAgentDescription.textContent = '自动汇总项目进度。';
  if (compactAgentCard) compactAgentCard.dataset.agentSearchText = '日报总结助手 自主规划 L2 自动汇总项目进度。';

  const radarMcpCard = Array.from(document.querySelectorAll('[data-tab-panel="mcp-plaza my-mcp"] article'))
    .find(card => card.querySelector('h3')?.textContent.trim() === 'radar-multi-table-for-mcp');
  const radarMcpDescription = radarMcpCard?.querySelector('p.mt-4.min-h-10');
  if (radarMcpDescription) radarMcpDescription.textContent = '连接多张业务数据表，支持统一检索、关联查询与结构化结果返回。';

  const passwordPanel = document.querySelector('#password-inline-panel'); const logoutConfirm = document.querySelector('#logout-confirm');
  document.querySelector('#password-menu-item')?.addEventListener('click', () => { passwordPanel?.classList.remove('hidden'); logoutConfirm?.classList.add('hidden'); });
  document.querySelector('#password-cancel')?.addEventListener('click', () => passwordPanel?.classList.add('hidden'));
  document.querySelector('#password-save')?.addEventListener('click', () => { passwordPanel?.classList.add('hidden'); setMenu(false); window.showMessage?.({ tone: 'success', text: '密码修改成功，请重新登录' }); });
  document.querySelector('#logout-menu-item')?.addEventListener('click', () => { logoutConfirm?.classList.remove('hidden'); passwordPanel?.classList.add('hidden'); });
  document.querySelector('#logout-cancel')?.addEventListener('click', () => logoutConfirm?.classList.add('hidden'));
  document.querySelectorAll('[data-user-menu-close]').forEach(item => item.addEventListener('click', () => setMenu(false)));
  document.querySelector('#logout-confirm-button')?.addEventListener('click', () => { logoutConfirm?.classList.add('hidden'); setMenu(false); window.showMessage?.({ tone: 'success', text: '已退出登录（原型演示）' }); });
})();
