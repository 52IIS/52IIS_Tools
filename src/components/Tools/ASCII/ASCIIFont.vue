<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { DocumentCopy } from '@element-plus/icons-vue'

const info = reactive({
  title: "ASCII艺术字生成器",
})

// 输入文本
const inputText = ref('52IIS_Tools')

// 字体选择
const selectedFont = ref('standard')

// ASCII字体定义
const fonts = {
  standard: {
    name: 'Standard',
    chars: {
      'A': [
        '  A  ',
        ' A A ',
        'AAAAA',
        'A   A',
        'A   A'
      ],
      'B': [
        'BBBB ',
        'B   B',
        'BBBB ',
        'B   B',
        'BBBB '
      ],
      'C': [
        ' CCC ',
        'C   C',
        'C    ',
        'C   C',
        ' CCC '
      ],
      'D': [
        'DDDD ',
        'D   D',
        'D   D',
        'D   D',
        'DDDD '
      ],
      'E': [
        'EEEEE',
        'E    ',
        'EEEE ',
        'E    ',
        'EEEEE'
      ],
      'F': [
        'EEEEE',
        'E    ',
        'EEEE ',
        'E    ',
        'E    '
      ],
      'G': [
        ' GGG ',
        'G    ',
        'G  GG',
        'G   G',
        ' GGG '
      ],
      'H': [
        'H   H',
        'H   H',
        'HHHHH',
        'H   H',
        'H   H'
      ],
      'I': [
        'IIIII',
        '  I  ',
        '  I  ',
        '  I  ',
        'IIIII'
      ],
      'J': [
        '  JJJ',
        '    J',
        '    J',
        'J   J',
        ' JJJ '
      ],
      'K': [
        'K   K',
        'K  K ',
        'KKKK ',
        'K  K ',
        'K   K'
      ],
      'L': [
        'L    ',
        'L    ',
        'L    ',
        'L    ',
        'LLLLL'
      ],
      'M': [
        'M   M',
        'MM MM',
        'M M M',
        'M   M',
        'M   M'
      ],
      'N': [
        'N   N',
        'NN  N',
        'N N N',
        'N  NN',
        'N   N'
      ],
      'O': [
        ' OOO ',
        'O   O',
        'O   O',
        'O   O',
        ' OOO '
      ],
      'P': [
        'PPPP ',
        'P   P',
        'PPPP ',
        'P    ',
        'P    '
      ],
      'Q': [
        ' OOO ',
        'O   O',
        'O O O',
        'O  O ',
        ' OOOO'
      ],
      'R': [
        'RRRR ',
        'R   R',
        'RRRR ',
        'R  R ',
        'R   R'
      ],
      'S': [
        ' SSS ',
        'S    ',
        ' SSS ',
        '    S',
        'SSS  '
      ],
      'T': [
        'TTTTT',
        '  T  ',
        '  T  ',
        '  T  ',
        '  T  '
      ],
      'U': [
        'U   U',
        'U   U',
        'U   U',
        'U   U',
        ' UUU '
      ],
      'V': [
        'V   V',
        'V   V',
        'V   V',
        ' V V ',
        '  V  '
      ],
      'W': [
        'W   W',
        'W   W',
        'W W W',
        'WW WW',
        'W   W'
      ],
      'X': [
        'X   X',
        ' X X ',
        '  X  ',
        ' X X ',
        'X   X'
      ],
      'Y': [
        'Y   Y',
        ' Y Y ',
        '  Y  ',
        '  Y  ',
        '  Y  '
      ],
      'Z': [
        'ZZZZZ',
        '    Z',
        '   Z ',
        '  Z  ',
        'ZZZZZ'
      ],
      '0': [
        ' 000 ',
        '0   0',
        '0   0',
        '0   0',
        ' 000 '
      ],
      '1': [
        ' 1 ',
        '11 ',
        ' 1 ',
        ' 1 ',
        '111'
      ],
      '2': [
        ' 222 ',
        '2   2',
        '   2 ',
        '  2  ',
        '22222'
      ],
      '3': [
        ' 333 ',
        '3   3',
        '  33 ',
        '3   3',
        ' 333 '
      ],
      '4': [
        '4   4',
        '4   4',
        '44444',
        '    4',
        '    4'
      ],
      '5': [
        '55555',
        '5    ',
        '5555 ',
        '    5',
        '5555 '
      ],
      '6': [
        ' 666 ',
        '6    ',
        '6666 ',
        '6   6',
        ' 666 '
      ],
      '7': [
        '77777',
        '    7',
        '   7 ',
        '  7  ',
        '  7  '
      ],
      '8': [
        ' 888 ',
        '8   8',
        ' 888 ',
        '8   8',
        ' 888 '
      ],
      '9': [
        ' 999 ',
        '9   9',
        ' 9999',
        '    9',
        ' 999 '
      ],
      '_': [
        '     ',
        '     ',
        '     ',
        '     ',
        '_____'
      ]
    }
  },
  slant: {
    name: 'Slant',
    chars: {
      'A': [
        '  /\\  ',
        ' /  \\ ',
        '/____\\',
        '\\    /',
        ' \\  / '
      ],
      'B': [
        '/\\   ',
        '\\ \\  ',
        '/\\ \\ ',
        '\\ \\//',
        '/\\__/ '
      ],
      'C': [
        '  ____',
        ' /    ',
        '/     ',
        '\\     ',
        ' \\____'
      ],
      'D': [
        '/\\    ',
        '\\ \\   ',
        ' / \\  ',
        '\\  \\ ',
        ' /__\\ '
      ],
      'E': [
        '/\\\\\\\\',
        '/    ',
        '/\\\\\\\\',
        '/    ',
        '/\\\\\\\\'
      ],
      'I': [
        '||',
        '||',
        '||',
        '||',
        '||'
      ],
      'S': [
        '  ___ ',
        '/    ',
        '  ___',
        '    \\',
        ' ___/'
      ],
      'T': [
        '/////',
        '  || ',
        '  || ',
        '  || ',
        '  || '
      ],
      'O': [
        '  /\\  ',
        ' /  \\ ',
        '/    \\',
        '\\    /',
        ' \\__/ '
      ],
      'L': [
        '/    ',
        '/    ',
        '/    ',
        '/    ',
        '/____'
      ],
      'U': [
        '\\    /',
        ' \\  / ',
        '  \\/  ',
        '  /\\  ',
        ' /  \\ '
      ],
      '0': [
        '  /\\  ',
        ' /  \\ ',
        '/    \\',
        '\\    /',
        ' \\__/ '
      ],
      '1': [
        '  |',
        ' /|',
        ' | |',
        ' |/ ',
        ' |  '
      ],
      '2': [
        ' /\\ ',
        '/  \\',
        '    /',
        '   /',
        '/\\/'
      ],
      '5': [
        '/\\\\\\',
        '/    ',
        '/\\\\\\',
        '    \\',
        '/\\\\\\'
      ],
      '_': [
        '     ',
        '     ',
        '     ',
        '     ',
        '_____'
      ]
      // 可以继续添加其他字符
    }
  },
  block: {
    name: 'Block',
    chars: {
      'A': [
        '██████',
        '██  ██',
        '██████',
        '██  ██',
        '██  ██'
      ],
      'B': [
        '█████ ',
        '██  ██',
        '█████ ',
        '██  ██',
        '█████ '
      ],
      'C': [
        ' ████ ',
        '██    ',
        '██    ',
        '██    ',
        ' ████ '
      ],
      'D': [
        '████  ',
        '██ ██ ',
        '██ ██ ',
        '██ ██ ',
        '████  '
      ],
      'E': [
        '██████',
        '██    ',
        '█████ ',
        '██    ',
        '██████'
      ],
      'I': [
        '██████',
        '  ██  ',
        '  ██  ',
        '  ██  ',
        '██████'
      ],
      'S': [
        ' ████ ',
        '██    ',
        ' ████ ',
        '    ██',
        '████  '
      ],
      'T': [
        '██████',
        '  ██  ',
        '  ██  ',
        '  ██  ',
        '  ██  '
      ],
      'O': [
        ' ████ ',
        '██  ██',
        '██  ██',
        '██  ██',
        ' ████ '
      ],
      'L': [
        '██    ',
        '██    ',
        '██    ',
        '██    ',
        '██████'
      ],
      'U': [
        '██  ██',
        '██  ██',
        '██  ██',
        '██  ██',
        ' ████ '
      ],
      '0': [
        ' ████ ',
        '██  ██',
        '██  ██',
        '██  ██',
        ' ████ '
      ],
      '1': [
        '  ██  ',
        ' ███  ',
        '  ██  ',
        '  ██  ',
        ' ████ '
      ],
      '2': [
        ' ████ ',
        '    ██',
        ' ████ ',
        '██    ',
        '██████'
      ],
      '5': [
        '██████',
        '██    ',
        '█████ ',
        '    ██',
        '█████ '
      ],
      '_': [
        '      ',
        '      ',
        '      ',
        '      ',
        '██████'
      ]
      // 可以继续添加其他字符
    }
  }
}

// 获取当前选中的字体
const currentFont = computed(() => fonts[selectedFont.value as keyof typeof fonts])

// 生成ASCII艺术字
const asciiArt = computed(() => {
  const text = inputText.value.toUpperCase()
  const font = currentFont.value
  const lines: string[] = ['', '', '', '', '']
  
  for (const char of text) {
    if (font.chars[char as keyof typeof font.chars]) {
      const charLines = font.chars[char as keyof typeof font.chars]
      for (let i = 0; i < 5; i++) {
        lines[i] += charLines[i] + '  '
      }
    }
  }
  
  return lines.join('\n')
})

// 复制ASCII艺术字
const copyAsciiArt = () => {
  copy(asciiArt.value)
}

// 字体列表
const fontList = Object.entries(fonts).map(([key, value]) => ({
  value: key,
  label: value.name
}))
</script>

<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4">
      <div class="p-6 bg-white rounded-lg shadow-md">
        <!-- 输入区域 -->
        <div class="mb-6">
          <el-text class="block mb-2 text-lg font-medium">输入文本</el-text>
          <el-input 
            v-model="inputText" 
            placeholder="请输入英文字母或数字" 
            class="w-full"
            maxlength="20"
            show-word-limit
          >
            <template #append>
              <el-button type="primary" @click="asciiArt">生成</el-button>
            </template>
          </el-input>
        </div>

        <!-- 字体选择 -->
        <div class="mb-6">
          <el-text class="block mb-2 text-lg font-medium">选择字体</el-text>
          <el-select v-model="selectedFont" placeholder="请选择字体" class="w-64">
            <el-option 
              v-for="font in fontList" 
              :key="font.value" 
              :label="font.label" 
              :value="font.value"
            ></el-option>
          </el-select>
        </div>

        <!-- 预览区域 -->
        <div class="mb-6">
          <el-text class="block mb-2 text-lg font-medium">预览</el-text>
          <div class="overflow-x-auto p-4 bg-gray-50 rounded-md">
            <pre class="font-mono text-sm whitespace-pre-wrap">{{ asciiArt }}</pre>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <el-button type="primary" @click="copyAsciiArt">
            <el-icon><DocumentCopy /></el-icon>
            复制
          </el-button>
        </div>
      </div>

      <!-- 工具说明 -->
      <div class="mt-6">
        <ToolDetail title="说明">
          <el-text>
            <ul>
              <li>支持输入英文字母和数字</li>
              <li>提供多种ASCII字体选择</li>
              <li>生成的ASCII艺术字可直接复制使用</li>
              <li>建议输入不超过20个字符以获得最佳效果</li>
            </ul>
          </el-text> 
        </ToolDetail>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  margin: 0;
  line-height: 1.5;
}
</style>