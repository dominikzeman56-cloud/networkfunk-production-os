import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.astro'].includes(e.name)) continue;
      walk(p, acc);
    } else if (/\\.(astro|ts|js|mjs|bat|ps1|json|py)$/i.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

const skipName = (f) => /package-lock|_phase0|Blueprint|AGENTS-HANDOFF|node_modules/.test(f);
const reHard = /D:[\\\/]J�'bjuZ�[_Ζ��U\�\����Y�Z[�����X�����^[�]��N��ۜ��K���	�OOHT���Q��QU�OOI�N]]�H�܈
�ۜ��و�[����
JHY�
��\�[YJ�JH�۝[�YN�ۜ�[�\�H�˜�XY�[T�[���	�]�	�K��]
�����N[�\˙�ܑXX�

JHO�Y�
�R\��\�

JH�ۜ��K���]��[]]�J����H
�	Ή�
�
H
�JH
�	Έ	�
���[J
K��X�JM
JN]���B�JNB��ۜ��K���	�U��]�N��ۜ��K���	��OOHQ�HSTԕ�OOI�N�ۜ�Y�\�\�H]���[����	��X��ܘ��Y�\��N�܈
�ۜ��و�[�Y�\�\�K��[\�

HO��[���]
	˘\����JJH�ۜ�H�˜�XY�[T�[���	�]�	�N�ۜ�[\�Hˋ���X]�[
�[\ܝ�����H�ȗV׉ȗJ��ȗK��WK�X\

JHO�K
JN�ۜ��K���]��[]]�J����JN[\˙�ܑXX�

JHO��ۜ��K���	�	�
�JJNB���ۜ��K���	��OOH����VH�ST�OOI�N�܈
�ۜ��[YHو���\�[��˘�]	�	��\�[��˜�I�	��\�[��˚���	�X��Y�K���ۉ�	˙[���^[\I�	ۜ�˘�ۙ�Y˚��ۉ�	�Q�S��RS�ё��Y	�	��\�L�ZYܘ]W�]˛Z���JH�ۜ��K����[YK�˙^\���[��]���[�����[YJJH�	�QT���	ӓ��NB���ۜ��K���	��OOHTH�ӑ�Q��[��HOOI�N�ۜ�\HH�˜�XY�[T�[��]���[����	��\��\��\K����K	�]�	�N�ۜ��K���	��Y����ۙ�Y��\K�[��Y\�	��Y����ۙ�Y��JN�ۜ��K���	��ґP�ԓ��	�\K�[��Y\�	��ґP�ԓ��	�JN�ۜ��K���	ۛ��\�\���K�Ζ��U\�\��˝\�
\JJN�ۜ��K���	�ܝ�NI���NK˝\�
\JJN��ۜ��K���	��OOH�ӑ�Q˕��S��HOOI�N�ۜ�ٙ�H�˜�XY�[T�[��]���[����	��X��ܘ��X���ۙ�Y˝��K	�]�	�N�ۜ��K���	ٚ[��ڙX����	�ٙ˚[��Y\�	ٚ[��ڙX����	�JN�ۜ��K���	�\P�\�I�ٙ˚[��Y\�	�^ܝ�ۜ�\P�\�I�JN�