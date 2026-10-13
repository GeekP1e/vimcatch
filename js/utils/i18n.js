const messages = {
    supportCoffee: ['☕ Buy me a coffee', '☕ На кофе', '☕ 请我喝杯咖啡', '☕ Invítame a un café'],
    practiceCommand: ['./practice', './практика', './练习', './práctica'],
    trainCommand: ['./train', './обучение', './学习', './aprendizaje'],
    cheatsCommand: ['./cheats', './справочник', './命令参考', './referencia'],
    mode: ['Mode', 'Режим', '模式', 'Modo'],
    time: ['Time Attack', 'На время', '限时练习', 'Contrarreloj'],
    duration: ['Duration', 'Длительность', '时长', 'Duración'],
    timeDescription: ['Solve as many editing tasks as possible before time runs out.', 'Решите как можно больше заданий до окончания времени.', '在时间结束前完成尽可能多的任务。', 'Resuelve tantas tareas como puedas antes de que termine el tiempo.'],
    commands: ['Commands', 'Команды', '命令', 'Comandos'],
    weakness: ['Weakness training', 'Слабые места', '弱项训练', 'Puntos débiles'],
    golf: ['Vim Golf', 'Vim-гольф', 'Vim 高尔夫', 'Vim Golf'],
    golfCurrent: ['Current attempt', 'Текущая попытка', '当前尝试', 'Intento actual'],
    golfLast: ['Last result', 'Последний результат', '上次结果', 'Último resultado'],
    golfBest: ['Personal best', 'Рекорд', '个人最佳', 'Récord personal'],
    golfKeys: ['keystrokes', 'нажатий', '次按键', 'pulsaciones'],
    golfSolved: ['Solved', 'Решено', '已完成', 'Resuelto'],
    yourText: ['Your text — editable', 'Ваш текст — редактируется', '你的文本 — 可编辑', 'Tu texto — editable'],
    targetText: ['Target — read only', 'Образец — только чтение', '目标 — 只读', 'Objetivo — solo lectura'],
    readOnly: ['READ ONLY', 'ТОЛЬКО ЧТЕНИЕ', '只读', 'SOLO LECTURA'],
    matchTarget: ['Make the text on the left exactly match the target on the right.', 'Измените текст слева так, чтобы он точно совпал с образцом справа.', '修改左侧文本，使其与右侧目标完全一致。', 'Modifica el texto de la izquierda para que coincida exactamente con el objetivo de la derecha.'],
    'golf-boot': ["Repair server startup","Исправить запуск сервера","修复服务器启动","Reparar el arranque"],
    'golf-boot-goal': ["Set environment to production, remove both debug lines, and move acceptTraffic() after registerRoutes(). Keep all other lines.","Установите environment в production, удалите обе строки отладки и перенесите acceptTraffic() после registerRoutes(). Остальные строки не меняйте.","将 environment 设为 production，删除两行调试输出，将 acceptTraffic() 移到 registerRoutes() 后。其余行不变。","Cambia environment a production, elimina ambas líneas de depuración y mueve acceptTraffic() después de registerRoutes(). Conserva las demás líneas."],
    'golf-client': ["Prepare the API client","Подготовить API-клиент","配置 API 客户端","Preparar el cliente API"],
    'golf-client-goal': ["Set host to https://api.example.com, token to release-token, retries to 3 and timeout to 5000. Remove token logging; keep the request call.","Установите host в https://api.example.com, token в release-token, retries в 3 и timeout в 5000. Удалите вывод токена; вызов request не меняйте.","将 host 设为 https://api.example.com，token 为 release-token，retries 为 3，timeout 为 5000。删除令牌日志，保留 request 调用。","Configura host como https://api.example.com, token como release-token, retries como 3 y timeout como 5000. Elimina el registro del token y conserva request."],
    'golf-release-notes': ["Release notes","Заметки к релизу","发布说明","Notas de versión"],
    'golf-release-notes-goal': ["Change the heading to \"# Release 2.0\" and delete the \"Status: draft\" line. Replace \"- [ ]\" with \"- [x]\" for both Run tests and Deploy. Move Deploy below Run tests, then add the line \"- Notify users\" immediately after Deploy. Keep the blank line after the heading and leave the other lines unchanged.","Замените заголовок на «# Release 2.0» и удалите строку «Status: draft». Замените «- [ ]» на «- [x]» у обоих пунктов: Run tests и Deploy. Перенесите Deploy ниже Run tests, затем добавьте строку «- Notify users» сразу после Deploy. Сохраните пустую строку после заголовка; остальные строки не меняйте.","将标题改为「# Release 2.0」，删除「Status: draft」行。将 Run tests 和 Deploy 两项的「- [ ]」改为「- [x]」。将 Deploy 移到 Run tests 下方，然后紧接着添加「- Notify users」行。保留标题后的空行，其他行不变。","Cambia el título a «# Release 2.0» y elimina la línea «Status: draft». Sustituye «- [ ]» por «- [x]» en Run tests y Deploy. Mueve Deploy debajo de Run tests y añade la línea «- Notify users» justo después de Deploy. Conserva la línea vacía tras el título y no cambies las demás líneas."],
    'golf-environment': ["Production environment","Рабочее окружение","生产环境","Entorno de producción"],
    'golf-environment-goal': ["Set APP_ENV=production, DEBUG=false and API_URL=https://api.example.com. Remove OLD_TOKEN. Move LOG_LEVEL=info directly below DEBUG=false and add RETRIES=3 after TIMEOUT=5000. Preserve the other lines.","Установите APP_ENV=production, DEBUG=false и API_URL=https://api.example.com. Удалите OLD_TOKEN. Перенесите LOG_LEVEL=info сразу под DEBUG=false и добавьте RETRIES=3 после TIMEOUT=5000. Остальные строки сохраните.","设置 APP_ENV=production、DEBUG=false、API_URL=https://api.example.com。删除 OLD_TOKEN，将 LOG_LEVEL=info 移到 DEBUG=false 后，在 TIMEOUT=5000 后添加 RETRIES=3。其他行不变。","Establece APP_ENV=production, DEBUG=false y API_URL=https://api.example.com. Elimina OLD_TOKEN, mueve LOG_LEVEL=info justo después de DEBUG=false y añade RETRIES=3 después de TIMEOUT=5000. Conserva lo demás."],
    'golf-landing': ["Landing page markup","Разметка лендинга","落地页标记","HTML de la página"],
    'golf-landing-goal': ["Change the h1 text to Vim practice, the button label to Start and its class to primary. Remove the obsolete paragraph. Move the button after the description and add <footer>Free to try</footer> before </main>. Keep two-space indentation.","Замените текст h1 на Vim practice, надпись кнопки на Start и её класс на primary. Удалите устаревший абзац. Перенесите кнопку после описания и добавьте <footer>Free to try</footer> перед </main>. Отступ — два пробела.","将 h1 文本改为 Vim practice，按钮文本改为 Start、class 改为 primary。删除过时段落，将按钮移到描述之后，在 </main> 前添加 <footer>Free to try</footer>，缩进两个空格。","Cambia el h1 a Vim practice, el texto del botón a Start y su clase a primary. Elimina el párrafo obsoleto, mueve el botón después de la descripción y añade <footer>Free to try</footer> antes de </main>, con dos espacios."],
    'golf-stylesheet': ["Button stylesheet","Стили кнопки","按钮样式","Estilos del botón"],
    'golf-stylesheet-goal': ["Rename .old-button to .action, set color to white and padding to 12px 20px. Remove opacity and the TODO comment. Place display: flex; first inside the rule and add gap: 8px; immediately after it. Keep two-space indentation.","Замените .old-button на .action, color на white и padding на 12px 20px. Удалите opacity и комментарий TODO. Поставьте display: flex; первым свойством и добавьте gap: 8px; сразу после него. Отступ — два пробела.","将 .old-button 改为 .action，color 改为 white，padding 改为 12px 20px。删除 opacity 和 TODO 注释，将 display: flex; 放到规则首位，紧接着添加 gap: 8px;，缩进两个空格。","Renombra .old-button a .action, cambia color a white y padding a 12px 20px. Elimina opacity y el comentario TODO. Pon display: flex; primero y añade gap: 8px; justo después, con dos espacios."],
    'golf-package': ["Package manifest","Манифест пакета","包清单","Manifiesto del paquete"],
    'golf-package-goal': ["Set name to vim-practice and version to 2.0.0. Remove the debug script. Change build to vite build and test to vitest run. Rename the dev script key to start; preserve commas and indentation.","Установите name в vim-practice и version в 2.0.0. Удалите скрипт debug. Замените build на vite build, test на vitest run, а ключ dev переименуйте в start. Сохраните запятые и отступы.","将 name 设为 vim-practice，version 设为 2.0.0。删除 debug 脚本，build 改为 vite build，test 改为 vitest run，将 dev 键改为 start。保留逗号和缩进。","Establece name como vim-practice y version como 2.0.0. Elimina debug, cambia build a vite build y test a vitest run. Renombra la clave dev a start; conserva comas y sangría."],
    'golf-query': ["Reporting query","Запрос для отчёта","报表查询","Consulta del informe"],
    'golf-query-goal': ["Rename old_users to users. Remove the legacy column and the SQL comment. Set status to active and LIMIT to 100. Move ORDER BY created_at DESC before LIMIT. Preserve all other lines.","Замените old_users на users. Удалите столбец legacy и SQL-комментарий. Установите status в active и LIMIT в 100. Перенесите ORDER BY created_at DESC перед LIMIT. Другие строки не меняйте.","将 old_users 改为 users，删除 legacy 列和 SQL 注释。将 status 设为 active，LIMIT 设为 100，将 ORDER BY created_at DESC 移到 LIMIT 前。其他行不变。","Renombra old_users a users. Elimina la columna legacy y el comentario SQL. Cambia status a active y LIMIT a 100. Mueve ORDER BY created_at DESC antes de LIMIT. Conserva las demás líneas."],
    'golf-deploy-script': ["Deployment script","Скрипт развёртывания","部署脚本","Script de despliegue"],
    'golf-deploy-script-goal': ["Add set -e after the shebang. Remove echo debug. Change npm install to npm ci and the deployment environment from staging to production. Move npm run deploy after npm test and change the final message to release complete.","Добавьте set -e после первой строки. Удалите echo debug. Замените npm install на npm ci, окружение staging на production. Перенесите npm run deploy после npm test и замените финальное сообщение на release complete.","在首行后添加 set -e，删除 echo debug，将 npm install 改为 npm ci，staging 改为 production，将 npm run deploy 移到 npm test 后，最后的消息改为 release complete。","Añade set -e después de la primera línea. Elimina echo debug, cambia npm install a npm ci y staging a production. Mueve npm run deploy después de npm test y cambia el mensaje final a release complete."],
    'golf-inventory': ["Clean inventory data","Очистить таблицу товаров","清理库存数据","Limpiar el inventario"],
    'golf-inventory-goal': ["Rename the qty header to stock. Remove the deprecated item. For keyboard, set price to 89 and stock to 12; for mouse, set stock to 30. Sort the remaining rows by name: keyboard, monitor, mouse. Preserve the other values.","Переименуйте заголовок qty в stock. Удалите товар deprecated. У keyboard установите цену 89 и остаток 12, у mouse — остаток 30. Расположите оставшиеся строки по имени: keyboard, monitor, mouse. Другие значения сохраните.","将 qty 表头改为 stock，删除 deprecated 商品。将 keyboard 的价格设为 89、库存设为 12，mouse 库存设为 30。按名称排列行：keyboard、monitor、mouse。其他值不变。","Renombra qty a stock y elimina el artículo deprecated. Para keyboard, establece precio 89 y stock 12; para mouse, stock 30. Ordena las filas: keyboard, monitor, mouse. Conserva los otros valores."],
    commandDescription: ['Practice tasks centered on the selected command family.', 'Задания на выбранные команды.', '练习所选命令。', 'Practica los comandos seleccionados.'],
    weaknessDescription: ['Tasks are selected from your least accurate Vim category.', 'Задания на навыки, которые требуют практики.', '练习需要提高的技能。', 'Practica las habilidades que necesitas mejorar.'],
    golfDescription: ['Fixed puzzles. Improve your personal best: fewer keystrokes is better.', 'Фиксированные задачи. Улучшайте рекорд: чем меньше нажатий, тем лучше.', '固定题目。按键越少越好，挑战个人最佳。', 'Retos fijos: mejora tu récord usando menos pulsaciones.'],
    tasksCompleted: ['tasks completed', 'заданий выполнено', '已完成任务', 'tareas completadas'],
    completedTasks: ['Tasks completed', 'Выполнено задач', '已完成任务', 'Tareas completadas'],
    score: ['Score', 'Очки', '得分', 'Puntos'],
    progress: ['Progress', 'Прогресс', '进度', 'Progreso'],
    motions: ['motions', 'движения', '移动', 'movimientos'],
    operators: ['operators', 'операторы', '操作符', 'operadores'],
    textObjects: ['text objects', 'текстовые объекты', '文本对象', 'objetos de texto'],
    trainingSession: ['Training session', 'Тренировка', '训练', 'Sesión de práctica'],
    achievements: ['$ achievements', '$ достижения', '$ 成就', '$ logros'],
    beginner: ['Beginner', 'Новичок', '初学者', 'Principiante'],
    searchmaster: ['Search Master', 'Мастер поиска', '搜索大师', 'Maestro de búsqueda'],
    beginnerTitle: ['Completed basic movement lessons', 'Пройдены уроки базовых движений', '完成基础移动课程', 'Lecciones básicas de movimiento completadas'],
    searchmasterTitle: ['Used search and search navigation', 'Освоены поиск и переход между совпадениями', '掌握搜索及结果导航', 'Búsqueda y navegación aprendidas'],
    beginnerEarned: ['Beginner Badge earned!', 'Получено достижение «Новичок»!', '已获得“初学者”徽章！', '¡Insignia Principiante conseguida!'],
    searchmasterEarned: ['Search Master Badge earned!', 'Получено достижение «Мастер поиска»!', '已获得“搜索大师”徽章！', '¡Insignia Maestro de búsqueda conseguida!'],
    streakDays: ['Streak: {days} days', 'Серия: {days} дн.', '连续 {days} 天', 'Racha: {days} días'],
    normalHelp: ['Press Esc for Normal mode', 'Нажмите Esc для обычного режима', '按 Esc 返回普通模式', 'Pulsa Esc para el modo normal'],
    repeat: ['repeat', 'повтор', '重复', 'repetir'],
    repeatTitle: ['Repeat the last change', 'Повторить последнее изменение', '重复上次修改', 'Repetir el último cambio'],
    deleteWordTask: ['Remove the highlighted obsolete word {word}.', 'Удалите выделенное устаревшее слово {word}.', '删除高亮的过时单词 {word}。', 'Elimina la palabra obsoleta resaltada {word}.'],
    deleteLineTask: ['Delete the highlighted deprecated middleware line.', 'Удалите выделенную строку устаревшего middleware.', '删除高亮的过时中间件行。', 'Elimina la línea resaltada de middleware obsoleto.'],
    replaceTask: ['Replace the highlighted quoted value with {value}.', 'Замените выделенное значение в кавычках на {value}.', '将高亮的引号内值替换为 {value}。', 'Reemplaza el valor resaltado entre comillas por {value}.'],
    moveLineTask: ['Move the highlighted {line} line below {after}.', 'Переместите выделенную строку {line} ниже {after}.', '将高亮的 {line} 行移至 {after} 下方。', 'Mueve la línea resaltada {line} debajo de {after}.'],
    repeatDeleteTask: ['Delete both highlighted debug lines.', 'Удалите обе выделенные строки отладки.', '删除两行高亮的调试代码。', 'Elimina ambas líneas de depuración resaltadas.'],
    seriesTask: ['Delete the highlighted debug line and replace the highlighted environment value with {value}.', 'Удалите выделенную строку отладки и замените выделенное значение окружения на {value}.', '删除高亮的调试行，并将环境值替换为 {value}。', 'Elimina la línea de depuración resaltada y cambia el entorno a {value}.'],
    moveTargetTask: ['Move to the highlighted target.', 'Переместите курсор к выделенной цели.', '将光标移至高亮目标。', 'Mueve el cursor al objetivo resaltado.'],
    searchTargetTask: ['Find the highlighted target using search.', 'Найдите выделенную цель с помощью поиска.', '使用搜索找到高亮目标。', 'Encuentra el objetivo resaltado mediante búsqueda.'],
    editTargetTask: ['Edit the highlighted text to produce:', 'Измените выделенный текст, чтобы получилось:', '修改高亮文本，使其成为：', 'Edita el texto resaltado para obtener:'],
    resetProgress: ['Reset progress', 'Сбросить прогресс', '重置进度', 'Restablecer progreso'],
    confirmResetProgress: ['Reset all progress and return to the first lesson? Completed lessons and streak will be reset.', 'Сбросить весь прогресс и вернуться к первому уроку? Пройденные уроки и серия занятий будут сброшены.', '重置所有进度并返回第一课？已完成课程和连续学习记录将被重置。', '¿Restablecer todo el progreso y volver a la primera lección? Se borrarán las lecciones completadas y la racha.'],
    resetProgressError: ['Could not reset progress.', 'Не удалось сбросить прогресс.', '无法重置进度。', 'No se pudo restablecer el progreso.'],
    goal: ['Goal', 'Цель', '目标', 'Objetivo'],
    type: ['Type exactly as shown', 'Введите команду, как показано', '按示例输入命令', 'Escribe el comando tal como se muestra'],
    lesson: ['Lesson', 'Урок', '课程', 'Lección'],
    level: ['Level', 'Уровень', '关卡', 'Nivel'],
    lessons: ['lessons', 'уроков', '节课', 'lecciones'],
    editor: ['VIM Editor', 'Редактор VIM', 'VIM 编辑器', 'Editor VIM'],
    reset: ['Start over', 'Начать сначала', '重新开始', 'Empezar de nuevo'],
    arena: ['Practice Arena', 'Практика', '练习区', 'Zona de práctica'],
    remaining: ['Time Remaining', 'Осталось времени', '剩余时间', 'Tiempo restante'],
    map: ['course map', 'карта курса', '课程地图', 'mapa del curso'],
    closeMap: ['close map', 'закрыть карту', '关闭课程地图', 'cerrar mapa'],
    utilities: ['Utilities', 'Инструменты', '工具', 'Utilidades'],
    practiceMode: ['Practice mode', 'Режим практики', '练习模式', 'Modo de práctica'],
    returnToTraining: ['Return to training', 'Вернуться к обучению', '返回训练', 'Volver al entrenamiento'],
    openPracticeArena: ['Open practice arena', 'Открыть практику', '打开练习区', 'Abrir zona de práctica'],
    challengeModeActive: ['Challenge mode active', 'Режим испытания активен', '挑战模式已启用', 'Modo de reto activo'],
    chooseLesson: ['Choose any lesson', 'Выберите любой урок', '选择任意课程', 'Elige cualquier lección'],
    previousLesson: ['Previous lesson', 'Предыдущий урок', '上一课', 'Lección anterior'],
    nextLesson: ['Next lesson', 'Следующий урок', '下一课', 'Lección siguiente'],
    basics: ['Basics', 'Основы', '基础', 'Fundamentos'],
    basicsDescription: ['Get oriented', 'Знакомство с Vim', '熟悉 Vim', 'Primeros pasos'],
    movement: ['Movement', 'Перемещение', '移动', 'Movimiento'],
    movementDescription: ['Navigate the buffer', 'Навигация по буферу', '在缓冲区中导航', 'Navega por el búfer'],
    editing: ['Editing', 'Редактирование', '编辑', 'Edición'],
    editingDescription: ['Delete, change, undo', 'Удаление, изменение, отмена', '删除、修改和撤销', 'Borra, cambia y deshaz'],
    visualSection: ['Visual', 'Visual', 'Visual', 'Visual'],
    visualDescription: ['Select, change and copy', 'Выделение, замена и копирование', '选择、修改和复制', 'Selecciona, cambia y copia'],
    searchSection: ['Search', 'Поиск', '搜索', 'Búsqueda'],
    searchDescription: ['Find text fast', 'Быстрый поиск текста', '快速查找文本', 'Encuentra texto rápido'],
    files: ['Files', 'Файлы', '文件', 'Archivos'],
    filesDescription: ['Write and open files', 'Сохранение и открытие файлов', '保存和打开文件', 'Guarda y abre archivos'],
    macros: ['Macros', 'Макросы', '宏', 'Macros'],
    macrosDescription: ['Record and replay edits', 'Запись и повтор действий', '录制和重放编辑', 'Graba y repite cambios'],
    advanced: ['Advanced', 'Продвинутый уровень', '进阶', 'Avanzado'],
    advancedDescription: ['Precision editing', 'Точное редактирование', '精确编辑', 'Edición precisa'],
    practiceHub: ['Practice Hub', 'Центр практики', '练习中心', 'Centro de práctica'],
    resume: ['Resume', 'Продолжить', '继续', 'Continuar'],
    start: ['Start', 'Начать', '开始', 'Empezar'],
    practiceRandom: ['Practice Random', 'Случайная практика', '随机练习', 'Práctica aleatoria'],
    streak: ['Streak', 'Серия', '连续天数', 'Racha'],
    accuracy: ['Accuracy', 'Точность', '准确率', 'Precisión'],
    days: ['{days} days', '{days} дн.', '{days} 天', '{days} días'],
    welcomeBack: ['Welcome back! Your streak is alive.', 'С возвращением! Серия продолжается.', '欢迎回来！连续记录仍在继续。', '¡Bienvenido de nuevo! Tu racha sigue activa.'],
    keepStreak: ['Keep the streak going', 'Продолжайте серию', '保持连续记录', 'Mantén la racha'],
    sessionSummary: ['Your session summary', 'Итоги занятия', '本次练习总结', 'Resumen de la sesión'],
    readyToLearn: ['Ready to learn Vim?', 'Готовы изучать Vim?', '准备学习 Vim 吗？', '¿Listo para aprender Vim?'],
    congratulations: ['Congratulations!', 'Поздравляем!', '恭喜！', '¡Enhorabuena!'],
    challengeComplete: ['Challenge Complete', 'Испытание завершено', '挑战完成', 'Reto completado'],
    challengeCompleteMessage: ['You completed {name}.', 'Вы завершили: {name}.', '你已完成{name}。', 'Has completado: {name}.'],
    playAnotherChallenge: ['Play Another Challenge', 'Ещё одно испытание', '再来一个挑战', 'Jugar otro reto'],
    returnToLevel: ['Return to Level', 'Вернуться к уроку', '返回课程', 'Volver a la lección'],
    timeUp: ['TIME UP', 'ВРЕМЯ ВЫШЛО', '时间到', 'TIEMPO AGOTADO'],
    openedFile: ['Opened {filename}', 'Открыт файл {filename}', '已打开 {filename}', 'Abierto {filename}'],
    notQuite: ['✖ Not quite', '✖ Пока неверно', '✖ 还不对', '✖ Aún no'],
    levelComplete: ['Level Complete!', 'Урок пройден!', '课程完成！', '¡Lección completada!'],
    levelCompleteMessage: ["Great job! You've mastered the basics of movement.", 'Отлично! Вы освоили основы перемещения.', '做得好！你已掌握基础移动。', '¡Buen trabajo! Has dominado los movimientos básicos.'],
    nextLevel: ['Next Level', 'Следующий урок', '下一课', 'Siguiente nivel'],
    mastered: ['MASTERED', 'ОСВОЕНО', '已掌握', 'DOMINADO'],
    courseMastered: ["You've conquered all Vim basics — you're unstoppable now!", 'Вы освоили основы Vim — теперь вас не остановить!', '你已掌握 Vim 基础，现在势不可挡！', '¡Has dominado las bases de Vim; ahora eres imparable!'],
    playAgain: ['Play Again', 'Играть снова', '再玩一次', 'Jugar de nuevo'],
    startPractice: ['Start practice', 'Пройти практику', '开始练习', 'Empezar la práctica'],
    repeatTraining: ['Repeat training', 'Пройти обучение ещё раз', '重新学习', 'Repetir la formación'],
    downloadExample: ['Lesson files', 'Файлы уроков', '课程文件', 'Archivos de lecciones'],
    templateTitle: ['Lesson files', 'Файлы уроков', '课程文件', 'Archivos de lecciones'],
    templateIntro: ['$ Import lesson → load your lesson.json\n$ Download JSON example → get a starter', '$ Импорт урока → загрузить свой lesson.json\n$ Скачать пример JSON → получить заготовку', '$ 导入课程 → 加载你的 lesson.json\n$ 下载 JSON 示例 → 获取模板', '$ Importar lección → cargar tu lesson.json\n$ Descargar ejemplo JSON → obtener plantilla'],
    templateSteps: ['> Download JSON example → edit JSON → Import lesson\n# Set the task, target and solution.\n# Saved here. Reload-safe.\n# Bad lesson? Delete it in My lessons.', '> Скачать пример JSON → правка JSON → Импорт урока\n# Задай задание, цель и решение.\n# Сохраняется здесь. Перезагрузку переживёт.\n# Урок сломан? Удали его в «Мои уроки».', '> 下载 JSON 示例 → 编辑 JSON → 导入课程\n# 设置任务、目标和解法。\n# 保存在此浏览器，刷新后仍可用。\n# 课程有误？在“我的课程”中删除。', '> Descargar ejemplo JSON → editar JSON → Importar lección\n# Define la tarea, el objetivo y la solución.\n# Se guarda aquí. Sobrevive a la recarga.\n# ¿Lección rota? Elimínala en Mis lecciones.'],
    downloadSource: ['Download JSON example', 'Скачать пример JSON', '下载 JSON 示例', 'Descargar ejemplo JSON'],
    templateLessonName: ['Delete a line', 'Удаление строки', '删除一行', 'Eliminar una línea'],
    templateAuthorName: ['Your name', 'Ваше имя', '你的名字', 'Tu nombre'],
    templateLearningObjective: ['Delete the current line with dd', 'Удалять текущую строку командой dd', '使用 dd 删除当前行', 'Eliminar la línea actual con dd'],
    templateTaskInstruction: ['Press dd to delete the highlighted line.', 'Нажмите dd, чтобы удалить выделенную строку.', '按 dd 删除高亮行。', 'Pulsa dd para eliminar la línea resaltada.'],
    templateKeepLine: ['keep this line', 'оставить эту строку', '保留这一行', 'conservar esta línea'],
    templateDeleteLine: ['delete this line', 'удалить эту строку', '删除这一行', 'eliminar esta línea'],
    templateKeepToo: ['keep this too', 'эту строку тоже оставить', '也保留这一行', 'conservar esta también'],
    uploadLesson: ['Import lesson', 'Импорт урока', '导入课程', 'Importar lección'],
    lessonImportSuccess: ['Lesson “{name}” was added and opened.', 'Урок «{name}» добавлен и открыт.', '课程“{name}”已添加并打开。', 'La lección «{name}» se añadió y abrió.'],
    lessonImportInvalid: ['The file is not a valid lesson. Check: {fields}.', 'Файл не является корректным уроком. Проверьте: {fields}.', '该文件不是有效课程。请检查：{fields}。', 'El archivo no es una lección válida. Revisa: {fields}.'],
    lessonImportReadError: ['Could not read the JSON file.', 'Не удалось прочитать JSON-файл.', '无法读取 JSON 文件。', 'No se pudo leer el archivo JSON.'],
    lessonImportTooLarge: ['The file is too large. Maximum size: 256 KB.', 'Файл слишком большой. Максимальный размер — 256 КБ.', '文件过大。最大为 256 KB。', 'El archivo es demasiado grande. Máximo: 256 KB.'],
    deleteLesson: ['Delete lesson', 'Удалить урок', '删除课程', 'Eliminar lección'],
    lessonDeleted: ['Lesson deleted. You can add it again from its JSON file.', 'Урок удалён. Его можно добавить снова из JSON-файла.', '课程已删除。可以从 JSON 文件重新添加。', 'Lección eliminada. Puedes volver a añadirla desde su JSON.'],
    lessonDeleteError: ['Could not delete the lesson.', 'Не удалось удалить урок.', '无法删除课程。', 'No se pudo eliminar la lección.'],
    customLessons: ['My lessons', 'Мои уроки', '我的课程', 'Mis lecciones'],
    customLessonsDescription: ['Imported from JSON', 'Добавлены из JSON', '从 JSON 导入', 'Importadas desde JSON']
};

const instructions = {
    "lesson-insert-variants-review": "Дополните три команды CI. На строке 2 через i добавьте «CI=1 ». На строке 3 перейдите к последней букве «npm» и через a добавьте « run». На строке 4 через A добавьте « --watch». После каждой правки нажимайте Esc.",
    "lesson-word-backward-b": "Нажмите b 4 раза, чтобы перейти назад от «test» к началу «compose».",
    "lesson-word-end-e": "Нажмите e 4 раза, чтобы перейти вперёд от «build» к последней букве «production».",
    "lesson-append-line-end": "Нажмите заглавную A для вставки в конце строки. Введите « ready», затем Esc.",
    "lesson-delete-word-end-de": "Командой de удалите «legacy», сохранив пробел после слова.",
    "lesson-delete-line-end": "Нажмите d, затем $, чтобы удалить текст от курсора до конца строки.",
    "lesson-delete-two-words": "Командой 2dw удалите устаревшие аргументы «legacy build » вместе с пробелом после них.",
    "lesson-delete-two-lines": "Нажмите 2, d, d, чтобы одной командой удалить обе средние строки.",
    "lesson-change-word-end-ce": "Командой ce замените «staging» на «production», сохранив пробел после слова. Введите замену и нажмите Esc.",
    "lesson-change-line-end": "Нажмите c, затем $. Введите «ready» и Esc, чтобы заменить остаток строки.",
    "lesson-match-brackets": "Курсор на открывающей «(». Нажмите %, чтобы перейти к парной «)», пропустив вложенные скобки.",
    "lesson-insert-before-i": "Через i вставьте «run » перед «server», затем нажмите Esc.",
    "lesson-open-line-above": "Нажмите заглавную O, чтобы открыть строку над «npm run build». Введите «npm install», затем Esc.",
    "lesson-delete-character-x": "Курсор на лишней «X» в настройке порта. Нажмите x, чтобы исправить «poXrt» на «port».",
    "lesson-delete-line-dd": "Средняя зависимость устарела. Нажмите d дважды (dd), чтобы удалить всю строку «legacy-parser».",
    "lesson-delete-word-dw": "Командой dw удалите устаревший аргумент «legacy» и пробел после него.",
    "lesson-replace-character-r": "Курсор на «?». Нажмите r, затем !, чтобы заменить символ без перехода в INSERT.",
    "lesson-substitute-character-s": "В адресе API ошибочный символ «x». На нём нажмите s, введите «//», затем Esc.",
    "lesson-visual-delete-v": "Установите LOG_LEVEL=info. Курсор на «d». Нажмите v, затем 5l, чтобы выделить «debug_», затем d для удаления.",
    "lesson-visual-change-c": "Измените каталог кеша с /tmp/cache на /var/cache. Курсор на «t». Нажмите v, затем 2l, чтобы выделить «tmp». Нажмите c, введите «var», затем Esc.",
    "lesson-visual-line-delete": "Удалите устаревшую настройку DEBUG_TRACE. Курсор внутри её строки. Нажмите заглавную V (Shift+v), чтобы выделить всю строку, затем d для удаления.",
    "lesson-visual-line-copy": "Скопируйте LOG_LEVEL=info в секцию production. Заглавной V (Shift+v) выделите строку настройки, затем y — скопируйте. Заглавной G перейдите к [production], затем p — вставьте строку ниже.",
    "lesson-visual-text-copy": "Дополните обе строки keyboard. Курсор на «8» в mouse,89,12. Нажмите v4ly, чтобы выделить и скопировать пять символов «89,12», затем k$p — вставить после запятой в keyboard,. Далее нажмите 0v8ly, чтобы скопировать «keyboard,», и G0P — вставить этот префикс перед значениями последней строки. P — заглавная (Shift+p).",
    "lesson-insert-append-mix": "Нажмите j для перехода на строку ниже. Через i добавьте «run » перед «server», затем Esc. Через A добавьте « ready», затем Esc. Результат: «run server ready».",
    "lesson-buffer-route-mix": "Нажмите gg для перехода наверх, w — к следующему слову, e — к концу слова «target».",
    "lesson-copy-append-mix": "Оставьте обычную команду тестов и добавьте ниже вариант с покрытием. Скопируйте «npm test» через yy и p, затем через G$a добавьте « --coverage». Нажмите Esc.",
    "lesson-delete-repair-mix": "Исправьте порядок шагов: уведомление о завершении должно идти после smoke-tests. Вырежьте текущую строку через dd, перейдите к smoke-tests через j и вставьте уведомление ниже через p.",
    "lesson-search-change-mix": "Найдите «broken» через /broken и Enter. Замените его на «fixed» через cw, затем нажмите Esc.",
    "lesson-macro-prefix-mix": "Запишите добавление префикса и переход вниз: qa0i> <Esc>jq. Выполните @a, затем @@, чтобы добавить «> » ко всем трём строкам.",
    "lesson-inner-word-append-mix": "Замените «wrong» на «right» через ciw и нажмите Esc. Затем через A добавьте «!» в конце строки и снова нажмите Esc.",
    "lesson-search-inner-word-mix": "Найдите «mistake» через /mistake и Enter. Нажмите l для перехода внутрь слова, затем diw, чтобы удалить только слово.",
    'lesson-first-line-gg': 'Нажмите g дважды (gg), чтобы перейти на первую строку. Курсор находится на последней строке; дойдите до первого символа первой строки.',
    'lesson-how-to-exit-ex-commands': 'Введите :q для выхода, затем нажмите Enter.',
    'lesson-save-and-quit': 'Введите :wq для сохранения и выхода, затем нажмите Enter.',
    'lesson-basic-movement': 'Перемещайте курсор клавишами h, j, k, l. Дойдите до символа «$».',
    "lesson-insert-mode": "Дополните заметку к релизу. Нажмите a, введите « is ready!» и нажмите Esc.",
    'lesson-word-movement': 'Нажмите w дважды, чтобы перейти к началу «build». Каждое нажатие w переводит к началу следующего слова.',
    'lesson-line-jumps': 'Нажмите G для перехода на последнюю строку, затем $ — на её последний символ.',
    'lesson-line-bounds-0-and': 'Нажмите $, чтобы перейти на последний символ текущей строки.',
    'lesson-line-start-zero': 'Курсор в середине строки. Нажмите 0, чтобы перейти на её первый символ.',
    "lesson-delete-basics": "Очистите конфигурацию сервисов. Нажмите j и dd, чтобы удалить устаревшую строку legacy-worker. На оставшейся строке worker через 10l перейдите к «legacy» и удалите это слово через dw.",
    "lesson-yank-put-copy-paste": "Добавьте NODE_ENV к сервисам worker и scheduler. Скопируйте строку через yy, перейдите через 3j и вставьте через p для worker. Затем через G перейдите на последнюю строку и снова нажмите p для scheduler.",
    'lesson-append-and-open-lines': 'Нажмите o, чтобы открыть строку под «npm install». Введите «npm run build», затем Esc.',
    "lesson-change-word-cw": "Командой cw измените уровень логирования с «debug» на «info». Введите новое значение и нажмите Esc.",
    "lesson-delete-end-replace": "Удалите комментарий «// TODO: verify URL» в конце строки через D, не меняя apiUrl. Затем перейдите вниз через j, к концу строки через $ и замените маркер «?» на «!» через r.",
    "lesson-counts-move-faster": "Используйте число повторений перед движением. Нажмите 3, затем w, чтобы перейти к началу «production».",
    'lesson-undo-redo': 'Удалите среднюю строку командой dd, отмените удаление командой u и повторите его через Ctrl+r.',
    'lesson-search-forward': 'Нажмите /, введите «target» и нажмите Enter. Нажмите n для перехода к следующему совпадению.',
    "lesson-search-backward": "Найдите предыдущее упоминание релиза «alpha»: нажмите ?, введите «alpha» и нажмите Enter.",
    'lesson-search-navigation-n-n': 'Найдите «foo» через /foo и нажмите n дважды для перехода к третьему совпадению.',
    'lesson-write-file': 'Сохраните текущий буфер: введите :w и нажмите Enter.',
    "lesson-edit-file": "Откройте notes.txt: введите :e notes.txt и нажмите Enter. В открытом файле замените «Status: draft» на «Status: ready» и нажмите Esc для возврата в NORMAL.",
    "lesson-record-macro": "Начните запись в регистр a через qa. Нажмите A, добавьте «!», нажмите Esc и j, затем остановите запись через q. Выполните @a дважды для следующих двух строк.",
    'lesson-repeat-macro': 'Запишите `xj` в регистр a командой qaxjq. Выполните @a один раз, затем повторите через @@.',
    "lesson-delete-inner-word-diw": "Изнутри слова «deprecated» нажмите diw, чтобы удалить устаревший аргумент сборки.",
    "lesson-change-inner-word-ciw": "Изнутри слова «staging» через ciw измените окружение на «production». Введите замену и нажмите Esc."
};

const chineseInstructions = {
    "lesson-insert-variants-review": "补全三条 CI 命令。在第 2 行用 i 添加「CI=1 」。在第 3 行移到 npm 的最后一个字母，用 a 添加「 run」。在第 4 行用 A 添加「 --watch」。每次编辑后按 Esc。",
    "lesson-word-backward-b": "按 b 4 次，从 test 向后移动到 compose 的开头。",
    "lesson-word-end-e": "按 e 4 次，从 build 向前移动到 production 的最后一个字母。",
    "lesson-append-line-end": "按大写 A 在行尾插入。输入一个空格和 ready，再按 Esc。",
    "lesson-delete-word-end-de": "用 de 删除 legacy，保留后面的空格。",
    "lesson-delete-line-end": "先按 d，再按 $，删除从光标到行尾的内容。",
    "lesson-delete-two-words": "用 2dw 删除过时的参数「legacy build 」及其后的空格。",
    "lesson-delete-two-lines": "依次按 2、d、d，用一条命令删除中间两行。",
    "lesson-change-word-end-ce": "用 ce 将 staging 改为 production，保留后面的空格。输入替换文本，再按 Esc。",
    "lesson-change-line-end": "先按 c，再按 $。输入 ready 并按 Esc，替换这一行的剩余内容。",
    "lesson-match-brackets": "光标在左括号 ( 上。按 % 跳到与它匹配的右括号 )，越过内部的括号。",
    "lesson-insert-before-i": "按 i，在 server 前输入 run 和一个空格，再按 Esc。",
    "lesson-open-line-above": "按大写 O 在 npm run build 上方新建一行。输入 npm install，再按 Esc。",
    "lesson-delete-character-x": "光标位于端口设置中多余的 X 上。按 x 将 poXrt 改为 port。",
    "lesson-delete-line-dd": "中间的依赖已过时。连续按两次 d（dd），删除 legacy-parser 所在的整行。",
    "lesson-delete-word-dw": "用 dw 删除过时的参数 legacy 及其后的空格。",
    "lesson-replace-character-r": "光标在 ? 上。先按 r，再按 !，无需进入 INSERT 模式即可替换字符。",
    "lesson-substitute-character-s": "API 地址中有错误字符 x。光标位于 x 时按 s，输入 //，再按 Esc。",
    "lesson-visual-delete-v": "设置 LOG_LEVEL=info。光标在 d 上。按 v，再按 5l 选中 debug_，然后按 d 删除。",
    "lesson-visual-change-c": "将缓存目录从 /tmp/cache 改为 /var/cache。光标在 t 上。按 v，再按 2l 选中 tmp。按 c，输入 var，再按 Esc。",
    "lesson-visual-line-delete": "删除过时的 DEBUG_TRACE 设置。光标在该行中。按大写 V（Shift+v）选中整行，再按 d 删除。",
    "lesson-visual-line-copy": "把 LOG_LEVEL=info 复制到 production 节。按大写 V（Shift+v）选中设置行，再按 y 复制。按大写 G 到达 [production]，再按 p 粘贴到下方。",
    "lesson-visual-text-copy": "补全两条 keyboard 行。光标位于 mouse,89,12 的 8 上。按 v4ly 选中并复制五个字符 89,12，再按 k$p 粘贴到 keyboard, 的逗号后。然后按 0v8ly 复制 keyboard,，用 G0P 将前缀粘贴到最后一行的数值前。P 为大写（Shift+p）。",
    "lesson-insert-append-mix": "按 j 移到下一行。用 i 在 server 前插入 run 和一个空格，然后按 Esc。用 A 添加一个空格和 ready，再按 Esc。结果应为 run server ready。",
    "lesson-buffer-route-mix": "按 gg 回到第一行，按 w 移到下一个单词，再按 e 到达 \"target\" 的词尾。",
    "lesson-copy-append-mix": "保留普通测试命令，在下方添加覆盖率版本。用 yy 和 p 复制 npm test，再用 G$a 添加「 --coverage」。按 Esc。",
    "lesson-delete-repair-mix": "修正部署步骤：完成通知必须在 smoke-tests 之后。用 dd 剪切当前行，用 j 移到 smoke-tests，再用 p 将通知粘贴到下方。",
    "lesson-search-change-mix": "输入 /broken 并按 Enter 查找 \"broken\"。用 cw 将其改为 \"fixed\"，再按 Esc。",
    "lesson-macro-prefix-mix": "录制添加前缀并向下移动：qa0i> <Esc>jq。执行 @a，再执行 @@，给三行都添加 \"> \"。",
    "lesson-inner-word-append-mix": "用 ciw 将 wrong 改为 right，再按 Esc。用 A 在行尾添加 !，然后再次按 Esc。",
    "lesson-search-inner-word-mix": "输入 /mistake 并按 Enter。按 l 移到词内，再用 diw 只删除该单词。",
    'lesson-first-line-gg': '连续按两次 g（gg）跳到第一行。光标从最后一行开始，请到达第一行的第一个字符。',
    'lesson-how-to-exit-ex-commands': '输入 :q 退出，然后按 Enter。',
    'lesson-save-and-quit': '输入 :wq 保存并退出，然后按 Enter。',
    'lesson-basic-movement': '用 h、j、k、l 移动光标，到达目标字符 "$"。',
    "lesson-insert-mode": "补全发布说明。按 a，输入「 is ready!」，再按 Esc。",
    'lesson-word-movement': '按两次 w 到达 build 的开头。每次按 w 都会移到下一个单词的开头。',
    'lesson-line-jumps': '按 G 跳到最后一行，再按 $ 移到该行的最后一个字符。',
    'lesson-line-bounds-0-and': '按 $ 跳到当前行的最后一个字符。',
    'lesson-line-start-zero': '光标在行中间。按 0 返回该行的第一个字符。',
    "lesson-delete-basics": "清理服务配置。按 j 和 dd 删除过时的 legacy-worker 行。在剩下的 worker 行用 10l 移到 legacy，再用 dw 删除该词。",
    "lesson-yank-put-copy-paste": "将 NODE_ENV 添加到 worker 和 scheduler 服务。用 yy 复制该行，再用 3j 和 p 粘贴到 worker。用 G 跳到最后一行，再按 p 粘贴到 scheduler。",
    'lesson-append-and-open-lines': '按 o 在 npm install 下方新建一行。输入 "npm run build"，再按 Esc。',
    "lesson-change-word-cw": "用 cw 将日志级别从 debug 改为 info。输入新值，再按 Esc。",
    "lesson-delete-end-replace": "用 D 删除行尾注释「// TODO: verify URL」，不要更改 apiUrl。按 j 下移，用 $ 到行尾，再用 r 将 ? 改为 !。",
    "lesson-counts-move-faster": "在移动命令前输入次数。先按 3，再按 w，直接移到 production 的开头。",
    'lesson-undo-redo': '用 dd 删除中间一行，用 u 撤销，再按 Ctrl+r 重做删除。',
    'lesson-search-forward': '按 /，输入 "target" 并按 Enter，再按 n 跳到下一个匹配。',
    "lesson-search-backward": "向后查找上一个 alpha 版本：按 ?，输入 alpha，再按 Enter。",
    'lesson-search-navigation-n-n': '用 /foo 搜索 "foo"，再按两次 n 到达第三个匹配。',
    'lesson-write-file': '保存当前缓冲区：输入 :w 并按 Enter。',
    "lesson-edit-file": "输入 :e notes.txt 并按 Enter 打开 notes.txt。在文件中将「Status: draft」改为「Status: ready」，再按 Esc 返回 NORMAL 模式。",
    "lesson-record-macro": "用 qa 开始录制到寄存器 a。按 A，添加 !，按 Esc 和 j，再用 q 停止录制。执行两次 @a，将宏应用到接下来的两行。",
    'lesson-repeat-macro': '用 qaxjq 将 `xj` 录制到寄存器 a。执行一次 @a，再用 @@ 重复。',
    "lesson-delete-inner-word-diw": "在 deprecated 词内用 diw 删除这个过时的构建参数。",
    "lesson-change-inner-word-ciw": "在 staging 词内用 ciw 将部署环境改为 production。输入替换文本，再按 Esc。"
};

const spanishInstructions = {
    "lesson-insert-variants-review": "Completa tres comandos de CI. En la línea 2 usa i para añadir \"CI=1 \". En la línea 3 ve al final de \"npm\" y usa a para añadir \" run\". En la línea 4 usa A para añadir \" --watch\". Pulsa Esc después de cada cambio.",
    "lesson-word-backward-b": "Pulsa b 4 veces para retroceder desde \"test\" al inicio de \"compose\".",
    "lesson-word-end-e": "Pulsa e 4 veces para avanzar desde \"build\" hasta la última letra de \"production\".",
    "lesson-append-line-end": "Pulsa A mayúscula para insertar al final de la línea. Escribe \" ready\" y pulsa Esc.",
    "lesson-delete-word-end-de": "Usa de para borrar \"legacy\" conservando el espacio siguiente.",
    "lesson-delete-line-end": "Pulsa d y luego $ para borrar desde el cursor hasta el final de la línea.",
    "lesson-delete-two-words": "Usa 2dw para borrar los argumentos obsoletos \"legacy build \" y el espacio que los sigue.",
    "lesson-delete-two-lines": "Pulsa 2, d, d para borrar las dos líneas centrales con un solo comando.",
    "lesson-change-word-end-ce": "Usa ce para cambiar \"staging\" por \"production\" conservando el espacio siguiente. Escribe el reemplazo y pulsa Esc.",
    "lesson-change-line-end": "Pulsa c y luego $. Escribe \"ready\" y pulsa Esc para cambiar el resto de la línea.",
    "lesson-match-brackets": "El cursor está en el paréntesis de apertura. Pulsa % para ir al cierre correspondiente, saltando el par interior.",
    "lesson-insert-before-i": "Pulsa i, escribe \"run \" antes de \"server\" y pulsa Esc.",
    "lesson-open-line-above": "Pulsa O mayúscula para abrir una línea encima de \"npm run build\". Escribe \"npm install\" y pulsa Esc.",
    "lesson-delete-character-x": "El cursor está sobre la X sobrante en el ajuste del puerto. Pulsa x para cambiar \"poXrt\" por \"port\".",
    "lesson-delete-line-dd": "La dependencia central está obsoleta. Pulsa d dos veces (dd) para borrar toda la línea de \"legacy-parser\".",
    "lesson-delete-word-dw": "Usa dw para borrar el argumento obsoleto \"legacy\" y el espacio siguiente.",
    "lesson-replace-character-r": "El cursor está sobre \"?\". Pulsa r y luego ! para reemplazarlo sin entrar en modo INSERT.",
    "lesson-substitute-character-s": "La URL de la API contiene una x incorrecta. Sobre x, pulsa s, escribe // y luego Esc.",
    "lesson-visual-delete-v": "Establece LOG_LEVEL=info. El cursor está sobre d. Pulsa v y luego 5l para seleccionar debug_; pulsa d para borrarlo.",
    "lesson-visual-change-c": "Cambia el directorio de caché de /tmp/cache a /var/cache. El cursor está sobre t. Pulsa v y luego 2l para seleccionar tmp. Pulsa c, escribe var y luego Esc.",
    "lesson-visual-line-delete": "Borra la opción obsoleta DEBUG_TRACE. El cursor está dentro de su línea. Pulsa V mayúscula (Shift+v) para seleccionar toda la línea y luego d para borrarla.",
    "lesson-visual-line-copy": "Copia LOG_LEVEL=info a la sección production. Pulsa V mayúscula (Shift+v) para seleccionar la línea y luego y para copiarla. Pulsa G mayúscula para ir a [production] y p para pegar debajo.",
    "lesson-visual-text-copy": "Completa ambas filas keyboard. El cursor está sobre el 8 de mouse,89,12. Pulsa v4ly para seleccionar y copiar los cinco caracteres 89,12 y k$p para pegar tras la coma de keyboard,. Después usa 0v8ly para copiar keyboard, y G0P para insertar ese prefijo antes de los valores de la última fila. P es mayúscula (Shift+p).",
    "lesson-insert-append-mix": "Pulsa j para bajar una línea. Usa i para insertar \"run \" antes de \"server\" y pulsa Esc. Usa A para añadir \" ready\" y pulsa Esc. El resultado debe ser \"run server ready\".",
    "lesson-buffer-route-mix": "Pulsa gg para volver arriba, w para ir a la siguiente palabra y e para llegar al final de \"target\".",
    "lesson-copy-append-mix": "Conserva el comando de pruebas y añade debajo una variante con cobertura. Duplica \"npm test\" con yy y p; usa G$a para añadir \" --coverage\". Pulsa Esc.",
    "lesson-delete-repair-mix": "Corrige el orden del despliegue: la notificación debe ir después de smoke-tests. Corta la línea actual con dd, ve a smoke-tests con j y pega la notificación debajo con p.",
    "lesson-search-change-mix": "Busca \"broken\" con /broken y Enter. Cámbialo por \"fixed\" con cw y pulsa Esc.",
    "lesson-macro-prefix-mix": "Graba un prefijo y baja una línea: qa0i> <Esc>jq. Ejecuta @a y luego @@ para añadir \"> \" a las tres líneas.",
    "lesson-inner-word-append-mix": "Cambia \"wrong\" por \"right\" con ciw y pulsa Esc. Añade \"!\" al final con A y vuelve a pulsar Esc.",
    "lesson-search-inner-word-mix": "Busca \"mistake\" con /mistake y Enter. Pulsa l para entrar en la palabra y diw para borrar solo la palabra.",
    'lesson-first-line-gg': 'Pulsa g dos veces (gg) para ir a la primera línea. El cursor empieza en la última línea; llega al primer carácter de la primera línea.',
    'lesson-how-to-exit-ex-commands': 'Escribe :q para salir y pulsa Enter.',
    'lesson-save-and-quit': 'Escribe :wq para guardar y salir y pulsa Enter.',
    'lesson-basic-movement': 'Mueve el cursor con h, j, k, l hasta el carácter "$".',
    "lesson-insert-mode": "Completa la nota de versión. Pulsa a, escribe \" is ready!\" y pulsa Esc.",
    'lesson-word-movement': 'Pulsa w dos veces para llegar al inicio de "build". Cada w mueve al inicio de la siguiente palabra.',
    'lesson-line-jumps': 'Pulsa G para ir a la última línea y luego $ para llegar a su último carácter.',
    'lesson-line-bounds-0-and': 'Pulsa $ para ir al último carácter de la línea actual.',
    'lesson-line-start-zero': 'El cursor está en medio de la línea. Pulsa 0 para volver al primer carácter.',
    "lesson-delete-basics": "Limpia la configuración de servicios. Pulsa j y dd para borrar legacy-worker. En la línea worker restante, usa 10l para llegar a \"legacy\" y bórralo con dw.",
    "lesson-yank-put-copy-paste": "Añade NODE_ENV a los servicios worker y scheduler. Copia la línea con yy y usa 3j y p para worker. Luego ve a la última línea con G y pulsa p para scheduler.",
    'lesson-append-and-open-lines': 'Pulsa o para abrir una línea debajo de "npm install". Escribe "npm run build" y pulsa Esc.',
    "lesson-change-word-cw": "Usa cw para cambiar el nivel de registro de \"debug\" a \"info\". Escribe el valor y pulsa Esc.",
    "lesson-delete-end-replace": "Borra el comentario final \"// TODO: verify URL\" con D sin cambiar apiUrl. Baja con j, ve al final con $ y usa r para cambiar \"?\" por \"!\".",
    "lesson-counts-move-faster": "Usa un número antes del movimiento. Pulsa 3 y luego w para ir directamente al inicio de \"production\".",
    'lesson-undo-redo': 'Borra la línea central con dd, deshaz con u y vuelve a borrar con Ctrl+r.',
    'lesson-search-forward': 'Pulsa /, escribe "target" y pulsa Enter. Pulsa n para ir a la siguiente coincidencia.',
    "lesson-search-backward": "Busca hacia atrás la mención anterior de la versión \"alpha\": pulsa ?, escribe \"alpha\" y pulsa Enter.",
    'lesson-search-navigation-n-n': 'Busca "foo" con /foo y pulsa n dos veces para llegar a la tercera coincidencia.',
    'lesson-write-file': 'Guarda el búfer actual: escribe :w y pulsa Enter.',
    "lesson-edit-file": "Abre notes.txt con :e notes.txt y Enter. En el archivo, cambia \"Status: draft\" por \"Status: ready\" y pulsa Esc para volver a NORMAL.",
    "lesson-record-macro": "Empieza a grabar en el registro a con qa. Pulsa A, añade \"!\", pulsa Esc y j, y termina con q. Ejecuta @a dos veces para las dos líneas siguientes.",
    'lesson-repeat-macro': 'Graba `xj` en el registro a con qaxjq. Ejecuta @a una vez y repite con @@.',
    "lesson-delete-inner-word-diw": "Desde dentro de \"deprecated\", usa diw para borrar el argumento de compilación obsoleto.",
    "lesson-change-inner-word-ciw": "Desde dentro de \"staging\", usa ciw para cambiar el entorno a \"production\". Escribe el reemplazo y pulsa Esc."
};

const languages = ['en', 'ru', 'zh-CN', 'es'];
// Terminology follows Vim Tutor, lessons 2.3 and 3.4.
const commandExplanations = {
    'v4ly → p / P': [
        'Copy 5 characters: v starts selection, 4l moves 4 characters right (the starting character is also selected), y copies and returns to NORMAL. Move to the destination; p pastes after the cursor, P (Shift+p) before it.',
        'Скопировать 5 символов: v включает выделение, 4l сдвигает курсор на 4 символа вправо (начальный символ тоже выделен), y копирует и возвращает в NORMAL. Перейдите к месту вставки: p вставляет после курсора, P (Shift+p) — перед ним.',
        '复制 5 个字符：v 开始选择，4l 向右移动 4 个字符（起始字符也被选中），y 复制并返回 NORMAL。移到目标位置；p 在光标后粘贴，P（Shift+p）在光标前粘贴。',
        'Copia 5 caracteres: v inicia la selección, 4l avanza 4 caracteres (también se selecciona el inicial), y copia y vuelve a NORMAL. Ve al destino; p pega después del cursor, P (Shift+p) antes de él.'
    ],
    'v4ly → k$p → 0v8ly → G0P': [
        'v4ly — v starts selection; 4l moves 4 characters right, selecting all 5 characters of "89,12"; y copies them.\nk$p — k moves one row up; $ goes to the final comma in "keyboard,"; p pastes "89,12" after it.\n0v8ly — 0 (digit zero) goes to line start; v8l selects the 9 characters of "keyboard,"; y copies them.\nG0P — G goes to the last row; 0 goes to its first character; P (Shift+p) pastes "keyboard," before "89,12".',
        'v4ly — v включает выделение; 4l сдвигает курсор на 4 символа вправо, выделяя все 5 символов «89,12»; y копирует их.\nk$p — k поднимает на строку выше; $ ставит курсор на последнюю запятую в «keyboard,»; p вставляет «89,12» после неё.\n0v8ly — 0 (цифра ноль) ставит курсор в начало строки; v8l выделяет 9 символов «keyboard,»; y копирует их.\nG0P — G переходит на последнюю строку; 0 — на её первый символ; P (Shift+p) вставляет «keyboard,» перед «89,12».',
        'v4ly — v 开始选择；4l 向右移动 4 个字符，共选中 "89,12" 的 5 个字符；y 复制。\nk$p — k 上移一行；$ 移到 "keyboard," 末尾的逗号；p 在逗号后粘贴 "89,12"。\n0v8ly — 0（数字零）移到行首；v8l 选中 "keyboard," 的 9 个字符；y 复制。\nG0P — G 移到最后一行；0 移到第一个字符；P（Shift+p）在 "89,12" 前粘贴 "keyboard,"。',
        'v4ly — v inicia la selección; 4l avanza 4 caracteres, seleccionando los 5 de "89,12"; y los copia.\nk$p — k sube una línea; $ va a la coma final de "keyboard,"; p pega "89,12" después de ella.\n0v8ly — 0 (el número cero) va al inicio de la línea; v8l selecciona los 9 caracteres de "keyboard,"; y los copia.\nG0P — G va a la última línea; 0 va a su primer carácter; P (Shift+p) pega "keyboard," antes de "89,12".'
    ],
    "hjkl": ["h/j/k/l: cursor motions left/down/up/right.","h/j/k/l — движения влево/вниз/вверх/вправо.","h/j/k/l：光标向左/下/上/右移动。","h/j/k/l: movimientos izquierda/abajo/arriba/derecha."],
    "h": ["h: motion left.","h — движение влево.","h：向左移动。","h: movimiento a la izquierda."],
    "j": ["j: motion one line down.","j — движение на строку вниз.","j：向下移动一行。","j: movimiento una línea abajo."],
    "k": ["k: motion one line up.","k — движение на строку вверх.","k：向上移动一行。","k: movimiento una línea arriba."],
    "l": ["l: motion right.","l — движение вправо.","l：向右移动。","l: movimiento a la derecha."],
    "w": ["w: motion to the next word start.","w — движение к началу следующего слова.","w：移到下一个单词的开头。","w: movimiento al inicio de la siguiente palabra."],
    "b": ["b: motion to the previous word start.","b — движение к началу предыдущего слова.","b：移到上一个单词的开头。","b: movimiento al inicio de la palabra anterior."],
    "e": ["e: motion to word end.","e — движение к концу слова.","e：移到词尾。","e: movimiento al final de palabra."],
    "0": ["0 (digit zero): motion to the first character of the line.","0 (цифра ноль) — движение к первому символу строки.","0（数字零）：移到行的第一个字符。","0 (el número cero): movimiento al primer carácter de la línea."],
    "$": ["$: motion to the last character of the line.","$ — движение к последнему символу строки.","$：移到行的最后一个字符。","$: movimiento al último carácter de la línea."],
    "G": ["G: motion to the last line.","G — движение к последней строке.","G：移到最后一行。","G: movimiento a la última línea."],
    "gg": ["gg: motion to the first line.","gg — движение к первой строке.","gg：移到第一行。","gg: movimiento a la primera línea."],
    "%": ["%: motion to the matching bracket.","% — движение к парной скобке.","%：移到匹配的括号。","%: movimiento al paréntesis o corchete correspondiente."],
    "i": ["i: enter INSERT before the cursor.","i — переход в INSERT перед курсором.","i：在光标前进入 INSERT 模式。","i: entrar en INSERT antes del cursor."],
    "a": ["a: enter INSERT after the cursor.","a — переход в INSERT после курсора.","a：在光标后进入 INSERT 模式。","a: entrar en INSERT después del cursor."],
    "A": ["A: enter INSERT at line end.","A — переход в INSERT в конце строки.","A：在行尾进入 INSERT 模式。","A: entrar en INSERT al final de la línea."],
    "o": ["o: open a line below and enter INSERT.","o — новая строка ниже и переход в INSERT.","o：在下方新建一行并进入 INSERT。","o: abrir una línea debajo y entrar en INSERT."],
    "O": ["O: open a line above and enter INSERT.","O — новая строка выше и переход в INSERT.","O：在上方新建一行并进入 INSERT。","O: abrir una línea encima y entrar en INSERT."],
    "Esc": ["Esc: return to NORMAL.","Esc — возврат в NORMAL.","Esc：返回 NORMAL 模式。","Esc: volver a NORMAL."],
    "x": ["x: delete the character under the cursor.","x — удаление символа под курсором.","x：删除光标下的字符。","x: borrar el carácter bajo el cursor."],
    "r": ["r: replace one character; the next key supplies its replacement.","r — замена одного символа; следующая клавиша задаёт новый символ.","r：替换一个字符；下一键指定替换字符。","r: reemplazar un carácter; la siguiente tecla indica el reemplazo."],
    "s": ["s: delete the character under the cursor and enter INSERT.","s — удалить символ под курсором и перейти в INSERT.","s：删除光标下的字符并进入 INSERT 模式。","s: borrar el carácter bajo el cursor y entrar en INSERT."],
    "v": ["v: enter characterwise VISUAL mode; move to extend the selection. Esc cancels.","v — посимвольное выделение в VISUAL; движения расширяют выделение. Esc отменяет выделение.","v：进入字符选择 VISUAL 模式；移动以扩展选择。Esc 取消选择。","v: entrar en VISUAL por caracteres; mueve el cursor para ampliar la selección. Esc cancela."],
    "V": ["V: select whole lines in VISUAL LINE mode. Esc cancels.","V — выделение целых строк в VISUAL LINE. Esc отменяет выделение.","V：在 VISUAL LINE 模式中选择整行。Esc 取消选择。","V: seleccionar líneas completas en VISUAL LINE. Esc cancela."],
    "c": ["c: replace the VISUAL selection by entering INSERT; type the replacement, then Esc.","c — заменить выделение VISUAL: перейти в INSERT, ввести новый текст и нажать Esc.","c：删除 VISUAL 选择并进入 INSERT；输入替换文本，再按 Esc。","c: cambiar la selección VISUAL entrando en INSERT; escribe el reemplazo y pulsa Esc."],
    "y": ["y: copy the VISUAL selection and return to NORMAL. v selects characters; V selects whole lines.","y — скопировать выделение VISUAL и вернуться в NORMAL. v выделяет символы, V — целые строки.","y：复制 VISUAL 选择并返回 NORMAL。v 选择字符，V 选择整行。","y: copiar la selección VISUAL y volver a NORMAL. v selecciona caracteres; V, líneas completas."],
    "d": ["d: delete the selection in VISUAL mode.","d — удалить выделение в режиме VISUAL.","d：删除 VISUAL 模式中的选择。","d: borrar la selección en modo VISUAL."],
    "D": ["D: shortcut for d$, delete to line end.","D — сокращение d$: удаление до конца строки.","D：d$ 的简写，删除到行尾。","D: abreviatura de d$, borrar hasta el final de la línea."],
    "yy": ["y: copy operator; yy copies the whole current line.","y — оператор копирования; yy копирует всю текущую строку.","y 是复制操作符；yy 复制整个当前行。","y: operador de copia; yy copia toda la línea actual."],
    "p": ["p: paste copied or deleted characters after the cursor; whole lines go below the current line.","p — вставить скопированные или удалённые символы после курсора; целые строки — ниже текущей.","p：将复制或删除的字符粘贴到光标后；整行则粘贴到当前行下方。","p: pegar caracteres copiados o borrados después del cursor; las líneas completas van debajo de la actual."],
    "P": ["P (Shift+p): paste copied or deleted characters before the cursor; whole lines go above the current line.","P (Shift+p) — вставить скопированные или удалённые символы перед курсором; целые строки — выше текущей.","P（Shift+p）：将复制或删除的字符粘贴到光标前；整行则粘贴到当前行上方。","P (Shift+p): pegar caracteres copiados o borrados antes del cursor; las líneas completas van encima de la actual."],
    "u": ["u: undo the last change.","u — отмена последнего изменения.","u：撤销上一次修改。","u: deshacer el último cambio."],
    "Ctrl+r": ["Ctrl+r: redo an undone change.","Ctrl+r — повтор отменённого изменения.","Ctrl+r：重做已撤销的修改。","Ctrl+r: rehacer un cambio deshecho."],
    "/": ["/: search forward; Enter confirms the query.","/ — поиск вперёд; Enter подтверждает запрос.","/：向前搜索；Enter 确认查询。","/: búsqueda hacia adelante; Enter confirma la consulta."],
    "?": ["?: search backward; Enter confirms the query.","? — поиск назад; Enter подтверждает запрос.","?：向后搜索；Enter 确认查询。","?: búsqueda hacia atrás; Enter confirma la consulta."],
    "n": ["n: next match in the search direction.","n — следующее совпадение по направлению поиска.","n：沿搜索方向移到下一个匹配。","n: siguiente coincidencia en la dirección de búsqueda."],
    "N": ["N: next match opposite to the search direction.","N — следующее совпадение против направления поиска.","N：沿相反方向移到下一个匹配。","N: siguiente coincidencia en sentido contrario a la búsqueda."],
    ":q": [":q: Ex command to quit.",":q — Ex-команда выхода.",":q：退出的 Ex 命令。",":q: comando Ex para salir."],
    ":wq": [":wq: Ex command to write and quit.",":wq — Ex-команда сохранения и выхода.",":wq：保存并退出的 Ex 命令。",":wq: comando Ex para guardar y salir."],
    ":w": [":w: Ex command to write the buffer.",":w — Ex-команда сохранения буфера.",":w：保存缓冲区的 Ex 命令。",":w: comando Ex para guardar el búfer."],
    ":e": [":e: Ex command to open a file; followed by its name.",":e — Ex-команда открытия файла; после неё указывается имя.",":e：打开文件的 Ex 命令；后接文件名。",":e: comando Ex para abrir un archivo; seguido de su nombre."],
    "qa": ["qa: record a macro in register a.","qa — запись макроса в регистр a.","qa：把宏录制到寄存器 a。","qa: grabar una macro en el registro a."],
    "q": ["q: stop macro recording.","q — остановка записи макроса.","q：停止录制宏。","q: detener la grabación de la macro."],
    "@a": ["@a: replay the macro in register a.","@a — выполнение макроса из регистра a.","@a：执行寄存器 a 中的宏。","@a: ejecutar la macro del registro a."],
    "@@": ["@@: replay the last executed macro.","@@ — повтор последнего выполненного макроса.","@@：重复上次执行的宏。","@@: repetir la última macro ejecutada."],
    'c$': ['c: change operator; $: motion to line end.', 'c — оператор изменения; $ — движение до конца строки.', 'c 是修改操作符；$ 是移到行尾的动作。', 'c: operador de cambio; $: movimiento al final de la línea.'],
    'd$': ['d: delete operator; $: motion to line end, including the last character.', 'd — оператор удаления; $ — движение до конца строки, включая последний символ.', 'd 是删除操作符；$ 是移到行尾的动作，包含最后一个字符。', 'd: operador de borrado; $: movimiento al final de la línea, incluido el último carácter.'],
    'dw': ['d: delete operator; w: motion to the next word start. The next word is not deleted.', 'd — оператор удаления; w — движение до начала следующего слова. Следующее слово не удаляется.', 'd 是删除操作符；w 是移到下一个单词开头的动作，不删除下一个单词。', 'd: operador de borrado; w: movimiento al inicio de la siguiente palabra. La siguiente palabra no se borra.'],
    'de': ['d: delete operator; e: motion to word end, including its last character. The following space stays.', 'd — оператор удаления; e — движение до конца слова, включая последнюю букву. Пробел после слова остаётся.', 'd 是删除操作符；e 是移到词尾的动作，包含最后一个字母。后面的空格保留。', 'd: operador de borrado; e: movimiento al final de palabra, incluida la última letra. Se conserva el espacio siguiente.'],
    'ce': ['c: change operator; e: motion to word end, including its last character. Type the replacement, then Esc.', 'c — оператор изменения; e — движение до конца слова, включая последнюю букву. Введите замену, затем Esc.', 'c 是修改操作符；e 是移到词尾的动作，包含最后一个字母。输入替换文本，再按 Esc。', 'c: operador de cambio; e: movimiento al final de palabra, incluida la última letra. Escribe el reemplazo y pulsa Esc.'],
    'cw': ['c: change operator; w: word motion. On a word, cw acts like ce: change to word end, then Esc.', 'c — оператор изменения; w — движение по словам. На слове cw работает как ce: замена до конца слова, затем Esc.', 'c 是修改操作符；w 是单词移动。在单词上，cw 的作用与 ce 相同：修改到词尾，再按 Esc。', 'c: operador de cambio; w: movimiento por palabras. Sobre una palabra, cw actúa como ce: cambia hasta el final y pulsa Esc.'],
    '2dw': ['2: count; d: delete operator; w: word motion. Delete two words with one command.', '2 — количество повторений; d — оператор удаления; w — движение по словам. Удалите два слова одной командой.', '2 是次数；d 是删除操作符；w 是单词移动。用一条命令删除两个单词。', '2: contador; d: operador de borrado; w: movimiento por palabras. Borra dos palabras con un comando.'],
    'dd': ['d: delete operator. Repeating it as dd deletes the whole current line.', 'd — оператор удаления. Повтор оператора в dd удаляет всю текущую строку.', 'd 是删除操作符。重复操作符形成 dd，删除整个当前行。', 'd: operador de borrado. Repetirlo como dd borra toda la línea actual.'],
    '2dd': ['2: count; dd: delete a whole line. Delete two consecutive lines.', '2 — количество повторений; dd — удаление целой строки. Удалите две строки подряд.', '2 是次数；dd 删除整行。删除连续两行。', '2: contador; dd: borrado de una línea completa. Borra dos líneas consecutivas.'],
    '3w': ['3: count; w: word motion. Move to the next word start three times.', '3 — количество повторений; w — движение по словам. Трижды перейдите к началу следующего слова.', '3 是次数；w 是单词移动。连续三次移到下一个单词的开头。', '3: contador; w: movimiento por palabras. Avanza tres veces al inicio de la siguiente palabra.'],
    'diw': ['d: delete operator; iw: inner-word text object. Delete the word without the spaces around it.', 'd — оператор удаления; iw — текстовый объект «слово изнутри». Удалите слово без окружающих пробелов.', 'd 是删除操作符；iw 是内部单词文本对象。删除单词，保留周围的空格。', 'd: operador de borrado; iw: objeto de texto interior de palabra. Borra la palabra sin los espacios que la rodean.'],
    'ciw': ['c: change operator; iw: inner-word text object. Replace the whole word, then Esc.', 'c — оператор изменения; iw — текстовый объект «слово изнутри». Замените слово целиком, затем Esc.', 'c 是修改操作符；iw 是内部单词文本对象。替换整个单词，再按 Esc。', 'c: operador de cambio; iw: objeto de texto interior de palabra. Reemplaza toda la palabra y pulsa Esc.']
};

export function lessonCommandExplanation(lesson) {
    const localeIndex = languages.indexOf(language);
    if (commandExplanations[lesson.focusCommand]) return commandExplanations[lesson.focusCommand][localeIndex];
    const keys = lesson.focusCommand === 'qa … q / @a'
        ? ['qa', 'q', '@a']
        : (lesson.focusCommand || '').match(/:wq|:q|:w|:e|Ctrl\+r|Esc|qa|@a|@@|diw|ciw|2dw|2dd|3w|dw|de|d\$|c\$|cw|ce|dd|yy|gg|hjkl|[hjklwbe0$G%iaAoOxrsDupPunNvVdcy/?]/g) || [];
    return [...new Set(keys)].map(key => commandExplanations[key]?.[localeIndex]).filter(Boolean).join(' ');
}

const hints = {
    'Passed': ['Пройдено', '已完成', 'Completado'],
    'Lesson complete — next lesson': ['Урок пройден — следующий урок', '本课已完成，开始下一课', 'Lección completada — siguiente lección'],
    'Course complete': ['Курс пройден', '课程已完成', 'Curso completado'],
    'Hint': ['Подсказка', '提示', 'Pista'],
    'Movement': ['Перемещение', '移动', 'Movimiento'],
    'Editing': ['Редактирование', '编辑', 'Edición'],
    'Search': ['Поиск', '搜索', 'Búsqueda'],
    'Other': ['Другие команды', '其他命令', 'Otros comandos'],
    'How Vim commands are built': ['Как устроены команды Vim', 'Vim 命令的结构', 'Cómo se construyen los comandos de Vim'],
    'count': ['количество', '次数', 'cantidad'],
    'operator': ['оператор', '操作符', 'operador'],
    'motion or text object': ['движение или текстовый объект', '移动或文本对象', 'movimiento u objeto de texto'],
    'A motion moves the cursor. An operator changes the text covered by a motion or text object.': ['Движение перемещает курсор. Оператор изменяет текстовый диапазон, заданный движением или текстовым объектом.', '移动命令会移动光标。操作符会修改由移动或文本对象选中的文本。', 'Un movimiento desplaza el cursor. Un operador modifica el texto seleccionado por un movimiento u objeto de texto.'],
    'Example: 3dw = repeat 3 times · d deletes · w moves to the next word.': ['Пример: 3dw = повторить 3 раза · d удаляет · w движется к следующему слову.', '示例：3dw = 重复 3 次 · d 删除 · w 移到下一个单词。', 'Ejemplo: 3dw = repetir 3 veces · d borra · w avanza a la siguiente palabra.'],
    'Motion': ['Движение', '移动', 'Movimiento'],
    'Mode command': ['Команда режима', '模式命令', 'Comando de modo'],
    'Immediate command': ['Немедленная команда', '立即命令', 'Comando inmediato'],
    'Operator + line': ['Оператор + строка', '操作符 + 行', 'Operador + línea'],
    'Operator + motion': ['Оператор + движение', '操作符 + 移动', 'Operador + movimiento'],
    'Operator + command': ['Оператор + команда', '操作符 + 命令', 'Operador + comando'],
    'Operator shortcut': ['Сокращение оператора', '操作符快捷方式', 'Atajo de operador'],
    'Search command': ['Команда поиска', '搜索命令', 'Comando de búsqueda'],
    'Repeat command': ['Команда повтора', '重复命令', 'Comando de repetición'],
    'History command': ['Команда истории', '历史命令', 'Comando de historial'],
    'Ex command': ['Ex-команда', 'Ex 命令', 'Comando Ex'],
    'Basic movement: left/down/up/right': ['Перемещение: влево/вниз/вверх/вправо', '移动：左/下/上/右', 'Movimiento: izquierda/abajo/arriba/derecha'],
    'Word motions: next/back/end': ['По словам: вперёд/назад/к концу', '按词移动：下一个/上一个/词尾', 'Palabras: siguiente/anterior/final'],
    'Go to first/last line': ['Первая/последняя строка', '跳到第一行/最后一行', 'Ir a la primera/última línea'],
    'Line start / end': ['Начало/конец строки', '行首/行尾', 'Inicio/final de línea'],
    'Insert/Append text': ['Вставить/добавить текст', '插入/追加文本', 'Insertar/añadir texto'],
    'Delete character': ['Удалить символ', '删除字符', 'Borrar carácter'],
    'Delete line': ['Удалить строку', '删除行', 'Borrar línea'],
    'Delete word': ['Удалить слово', '删除单词', 'Borrar palabra'],
    'Yank and paste line': ['Скопировать и вставить строку', '复制并粘贴行', 'Copiar y pegar línea'],
    'Change word': ['Изменить слово', '修改单词', 'Cambiar palabra'],
    'Delete to end of line': ['Удалить до конца строки', '删除到行尾', 'Borrar hasta el final de línea'],
    'Replace one character': ['Заменить символ', '替换一个字符', 'Reemplazar un carácter'],
    'Search forward for text': ['Поиск текста вперёд', '向前搜索文本', 'Buscar texto hacia adelante'],
    'Search backward for text': ['Поиск текста назад', '向后搜索文本', 'Buscar texto hacia atrás'],
    'Next / Previous match': ['Следующее/предыдущее совпадение', '下一个/上一个匹配', 'Coincidencia siguiente/anterior'],
    'Undo / Redo changes': ['Отменить/повторить изменение', '撤销/重做修改', 'Deshacer/rehacer cambios'],
    'Quit / Write & Quit': ['Выход/сохранение и выход', '退出/保存并退出', 'Salir/guardar y salir'],
    'Use 3w to jump 3 words forward': ['Нажмите 3w, чтобы перейти на три слова вперёд.', '按 3w 向前移动三个单词。', 'Pulsa 3w para avanzar tres palabras.'],
    'Use $ to jump to end of line': ['Нажмите $ для перехода к концу строки.', '按 $ 跳到行尾。', 'Pulsa $ para ir al final de la línea.'],
    'Use gg to jump to first line': ['Нажмите gg для перехода к первой строке.', '按 gg 跳到第一行。', 'Pulsa gg para ir a la primera línea.'],
    "Position cursor on 'r' of 'remove', then use dw": ['Поставьте курсор на r в remove и нажмите dw.', '将光标移到 remove 的 r，然后按 dw。', 'Coloca el cursor en la r de remove y pulsa dw.'],
    'Use j to go down to second line, then dd to delete it': ['Нажмите j для перехода ко второй строке, затем dd для удаления.', '按 j 到第二行，再按 dd 删除它。', 'Pulsa j para bajar a la segunda línea y dd para borrarla.'],
    "Position cursor on 'B' of 'BAD', use cw then type 'GOOD'": ['Поставьте курсор на B в BAD, нажмите cw и введите GOOD.', '将光标移到 BAD 的 B，按 cw 并输入 GOOD。', 'Coloca el cursor en la B de BAD, pulsa cw y escribe GOOD.'],
    'Use yy to yank the current line': ['Нажмите yy для копирования текущей строки.', '按 yy 复制当前行。', 'Pulsa yy para copiar la línea actual.'],
    'Use jp': ['Нажмите j, затем p: перейти вниз и вставить строку.', '按 j，再按 p：下移并粘贴行。', 'Pulsa j y luego p para bajar y pegar la línea.'],
    "Position cursor on 'x', use r then !": ['Поставьте курсор на x, нажмите r, затем !.', '将光标移到 x，按 r，再按 !。', 'Coloca el cursor en x, pulsa r y luego !.'],
    'Command Reference': ['Справочник команд', '命令参考', 'Referencia de comandos'],
    'Close': ['Закрыть', '关闭', 'Cerrar'],
    'Search Vim commands... (Ctrl+/)': ['Поиск команд Vim… (Ctrl+/)', '搜索 Vim 命令… (Ctrl+/)', 'Buscar comandos Vim… (Ctrl+/)']
};

export function translateHint(text) {
    return hints[text]?.[languages.indexOf(language) - 1] || text;
}

const localizedInstructions = { ru: instructions, 'zh-CN': chineseInstructions, es: spanishInstructions };
let language = 'en';

export function t(key) {
    return messages[key]?.[languages.indexOf(language)] || key;
}

export function practiceInstruction(task) {
    if (task.instructionKey) return t(task.instructionKey);
    const interpolate = (key, values = {}) => Object.entries(values)
        .reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), t(key));
    if (task.id.startsWith('drill-')) {
        if (task.target) return t(task.name.startsWith('Search') ? 'searchTargetTask' : 'moveTargetTask');
        return `${t('editTargetTask')}\n${(task.targetContent || [task.targetText?.text]).filter(line => line !== undefined).join('\n')}`;
    }
    const value = task.targetBody?.find(line => /const (environment|env) =/.test(line))?.match(/"([^"]+)"/)?.[1];
    if (task.id.startsWith('delete-word-')) return interpolate('deleteWordTask', { word: `'${task.cursorToken}'` });
    if (task.id.startsWith('delete-line-')) return t('deleteLineTask');
    if (task.id.startsWith('replace-quotes-')) return interpolate('replaceTask', { value });
    if (task.id.startsWith('move-line-')) return interpolate('moveLineTask', { line: `${task.cursorToken}()`, after: task.targetBody[1].replace(/;$/, '') });
    if (task.id.startsWith('repeat-delete-')) return t('repeatDeleteTask');
    if (task.id.startsWith('edit-series-')) return interpolate('seriesTask', { value });
    return task.instruction;
}

export function practiceName(challenge) {
    if (challenge.mode === 'time') return t(challenge.mode);
    return challenge.mode === 'commands' ? t('commands') : challenge.mode === 'weakness' ? t('weakness')
        : challenge.mode === 'golf' ? t('golf') : challenge.name;
}

export function practiceDescription(challenge) {
    const key = { time: 'timeDescription', commands: 'commandDescription', weakness: 'weaknessDescription', golf: 'golfDescription' }[challenge.mode];
    return key ? t(key) : challenge.description;
}

export function lessonInstructions(lesson) {
    return localizedInstructions[language]?.[lesson.id] || lesson.instructions;
}

export function initializeLanguage(onChange) {
    try {
        const savedLanguage = localStorage.getItem('vimcatchLanguage');
        language = languages.includes(savedLanguage) ? savedLanguage : 'en';
    } catch { /* Language selection also works without browser storage. */ }

    const selector = document.getElementById('language-select');
    const apply = () => {
        document.documentElement.lang = language;
        if (selector) selector.value = language;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });
        document.querySelectorAll('[data-hint]').forEach(element => {
            element.textContent = translateHint(element.dataset.hint);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            element.placeholder = t(element.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
        });
        const search = document.getElementById('cheat-search');
        if (search) search.placeholder = translateHint('Search Vim commands... (Ctrl+/)');
    };
    apply();
    selector?.addEventListener('change', () => {
        language = languages.includes(selector.value) ? selector.value : 'en';
        try { localStorage.setItem('vimcatchLanguage', language); } catch { /* Optional persistence. */ }
        apply();
        onChange();
    });
}
