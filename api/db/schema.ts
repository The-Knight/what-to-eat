import db from './index.js';

export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      difficulty INTEGER DEFAULT 1,
      cook_time TEXT,
      cover_image TEXT,
      ingredients TEXT,
      steps TEXT,
      tips TEXT,
      dish_type TEXT DEFAULT '荤菜',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // 只在首次启动（recipes表为空）时才初始化分类和菜谱数据
  const { rows: recipeCountRows } = await db.execute('SELECT COUNT(*) as count FROM recipes');
  const recipeCount = recipeCountRows[0] as { count: number };
  if (recipeCount.count === 0) {
    // 检查分类是否已存在，避免重复插入
    const { rows: categoryCountRows } = await db.execute('SELECT COUNT(*) as count FROM categories');
    const categoryCount = categoryCountRows[0] as { count: number };
    if (categoryCount.count === 0) {
      const categories: [string, number][] = [
        ['家常菜', 1], ['汤品', 2], ['甜点', 3], ['主食', 4],
      ];
      await db.batch(categories.map(([name, order]) => ({
        sql: 'INSERT INTO categories (name, sort_order) VALUES (?, ?)',
        args: [name, order],
      })));
    }

    // Seed sample recipes
    const sampleRecipes = [
      {
        name: '番茄炒蛋',
        category_id: 1,
        difficulty: 1,
        cook_time: '15分钟',
        dish_type: '荤菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20tomato%20scrambled%20eggs%20dish%20on%20a%20white%20ceramic%20plate%2C%20bright%20red%20tomatoes%20with%20fluffy%20golden%20eggs%2C%20garnished%20with%20chopped%20green%20onions%2C%20warm%20natural%20lighting%2C%20overhead%20shot%2C%20wooden%20table%20background%2C%20food%20magazine%20style&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '番茄', amount: '2个' },
          { name: '鸡蛋', amount: '3个' },
          { name: '食用油', amount: '适量' },
          { name: '盐', amount: '适量' },
          { name: '糖', amount: '少许' },
          { name: '葱花', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '番茄洗净切块，鸡蛋打散加少许盐搅匀',
          '锅中热油，倒入蛋液炒至凝固盛出',
          '锅中留底油，放入番茄块翻炒出汁',
          '加入炒好的鸡蛋，加盐和少许糖调味',
          '翻炒均匀，撒上葱花即可出锅',
        ]),
        tips: '番茄要炒出汁水，加少许糖可以提鲜去酸。',
      },
      {
        name: '宫保鸡丁',
        category_id: 1,
        difficulty: 2,
        cook_time: '25分钟',
        dish_type: '荤菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Kung%20Pao%20chicken%20dish%2C%20diced%20chicken%20with%20peanuts%20and%20dried%20chili%20peppers%2C%20glossy%20brown%20sauce%2C%20served%20in%20a%20traditional%20Chinese%20bowl%2C%20warm%20studio%20lighting%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '鸡胸肉', amount: '300g' },
          { name: '花生米', amount: '50g' },
          { name: '干辣椒', amount: '8-10个' },
          { name: '花椒', amount: '1小勺' },
          { name: '黄瓜', amount: '1根' },
          { name: '蒜', amount: '3瓣' },
          { name: '姜', amount: '3片' },
          { name: '酱油', amount: '2勺' },
          { name: '醋', amount: '1勺' },
          { name: '糖', amount: '1勺' },
          { name: '淀粉', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '鸡胸肉切丁，用酱油、淀粉腌制15分钟',
          '黄瓜切丁，干辣椒剪段，花生米炒熟备用',
          '调碗汁：酱油、醋、糖、淀粉加水调匀',
          '锅中热油，爆香花椒和干辣椒',
          '放入鸡丁滑炒至变色',
          '加入蒜末姜末爆香，倒入碗汁',
          '最后放入黄瓜丁和花生米翻炒均匀',
        ]),
        tips: '鸡丁腌制后口感更嫩滑，花生米最后放保持酥脆。',
      },
      {
        name: '白切鸡',
        category_id: 1,
        difficulty: 2,
        cook_time: '40分钟',
        dish_type: '荤菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20white%20cut%20chicken%20poached%20chicken%20sliced%20on%20a%20plate%2C%20golden%20skin%2C%20served%20with%20ginger%20scallion%20sauce%2C%20clean%20white%20plate%2C%20natural%20daylight%2C%20elegant%20presentation&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '三黄鸡', amount: '1只（约1.5kg）' },
          { name: '姜', amount: '5片' },
          { name: '葱', amount: '3根' },
          { name: '料酒', amount: '2勺' },
          { name: '香油', amount: '适量' },
          { name: '酱油', amount: '适量' },
          { name: '沙姜', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '整鸡洗净，锅中烧水加入姜片、葱段和料酒',
          '水开后放入整鸡，大火煮开后转小火煮25分钟',
          '关火后焖15分钟，取出放入冰水中浸泡',
          '调蘸料：沙姜切末，加酱油和香油',
          '鸡肉切块装盘，配蘸料食用',
        ]),
        tips: '三浸三提可以让鸡皮更爽滑。冰水浸泡是关键步骤。',
      },
      {
        name: '紫菜蛋花汤',
        category_id: 4,
        difficulty: 1,
        cook_time: '10分钟',
        dish_type: '素菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20seaweed%20egg%20drop%20soup%20in%20a%20ceramic%20bowl%2C%20delicate%20egg%20ribbons%20floating%20in%20clear%20broth%20with%20dark%20seaweed%2C%20garnished%20with%20green%20onions%2C%20steaming%20hot%2C%20warm%20cozy%20atmosphere&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '紫菜', amount: '10g' },
          { name: '鸡蛋', amount: '2个' },
          { name: '虾皮', amount: '少许' },
          { name: '盐', amount: '适量' },
          { name: '香油', amount: '几滴' },
          { name: '葱花', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '紫菜用清水泡开洗净，鸡蛋打散备用',
          '锅中烧水，加入虾皮煮出鲜味',
          '水开后放入紫菜，煮1分钟',
          '将蛋液沿锅边缓缓倒入，形成蛋花',
          '加盐调味，淋几滴香油，撒葱花即可',
        ]),
        tips: '蛋液要在水滚时倒入，形成漂亮的蛋花。紫菜不要煮太久。',
      },
      {
        name: '红糖糍粑',
        category_id: 5,
        difficulty: 2,
        cook_time: '30分钟',
        dish_type: '素菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20brown%20sugar%20glutinous%20rice%20cakes%20on%20a%20plate%2C%20golden%20crispy%20exterior%2C%20drizzled%20with%20dark%20brown%20sugar%20syrup%2C%20sprinkled%20with%20soybean%20powder%2C%20sweet%20dessert%2C%20rustic%20wooden%20background&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '糯米粉', amount: '200g' },
          { name: '红糖', amount: '50g' },
          { name: '黄豆粉', amount: '适量' },
          { name: '食用油', amount: '适量' },
          { name: '水', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '糯米粉加温水揉成光滑面团',
          '分成小剂子，搓圆后压扁成小饼',
          '平底锅中放少许油，小火煎至两面金黄',
          '红糖加少许水煮成糖浆',
          '糍粑装盘，淋上红糖浆，撒上黄豆粉',
        ]),
        tips: '煎的时候用小火，避免外焦里生。红糖浆要趁热淋。',
      },
      {
        name: '蛋炒饭',
        category_id: 6,
        difficulty: 1,
        cook_time: '10分钟',
        dish_type: '素菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20egg%20fried%20rice%20in%20a%20wok%2C%20golden%20grains%20of%20rice%20with%20scrambled%20egg%20pieces%20and%20green%20onions%2C%20perfectly%20separated%20grains%2C%20top%20view%2C%20warm%20lighting%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '隔夜米饭', amount: '1碗' },
          { name: '鸡蛋', amount: '2个' },
          { name: '葱花', amount: '适量' },
          { name: '盐', amount: '适量' },
          { name: '食用油', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '隔夜米饭打散，鸡蛋加少许盐搅匀',
          '锅中多放些油烧热，倒入蛋液快速翻炒',
          '蛋液半凝固时加入米饭，大火翻炒',
          '不断翻炒让米饭粒粒分明，加入盐调味',
          '最后撒入葱花翻炒均匀即可',
        ]),
        tips: '用隔夜饭效果最好，粒粒分明。大火快炒是关键。',
      },
      {
        name: '凉拌鸡丝',
        category_id: 1,
        difficulty: 1,
        cook_time: '20分钟',
        dish_type: '荤菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20cold%20shredded%20chicken%20salad%2C%20tender%20white%20chicken%20shreds%20with%20cucumber%2C%20chili%20oil%2C%20sesame%20seeds%2C%20and%20cilantro%2C%20beautiful%20plating%20on%20a%20ceramic%20plate%2C%20natural%20light%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '鸡胸肉', amount: '1块（约300g）' },
          { name: '黄瓜', amount: '1根' },
          { name: '胡萝卜', amount: '半根' },
          { name: '蒜末', amount: '3瓣' },
          { name: '生抽', amount: '2勺' },
          { name: '香醋', amount: '1勺' },
          { name: '辣椒油', amount: '1勺' },
          { name: '香油', amount: '1小勺' },
          { name: '白芝麻', amount: '适量' },
          { name: '香菜', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '鸡胸肉冷水下锅，加姜片葱段，煮15分钟至熟透',
          '捞出放入冰水中浸泡至凉透',
          '黄瓜和胡萝卜切丝，铺在盘底',
          '鸡胸肉顺纹路撕成细丝',
          '将蒜末、生抽、香醋、辣椒油、香油调成酱汁',
          '鸡丝放在蔬菜上，淋上酱汁，撒白芝麻和香菜',
        ]),
        tips: '鸡胸肉不要煮太久，冰水浸泡后更容易撕丝。顺纹路撕口感更好。',
      },
      {
        name: '白菜炖粉条',
        category_id: 1,
        difficulty: 1,
        cook_time: '25分钟',
        dish_type: '半荤半素',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20cabbage%20stew%20with%20glass%20noodles%20in%20a%20clay%20pot%2C%20soft%20translucent%20cabbage%20leaves%2C%20clear%20glass%20noodles%2C%20rich%20broth%2C%20steaming%20hot%2C%20cozy%20home%20cooking%20style%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '大白菜', amount: '半棵' },
          { name: '红薯粉条', amount: '100g' },
          { name: '五花肉', amount: '100g' },
          { name: '蒜', amount: '3瓣' },
          { name: '干辣椒', amount: '2个' },
          { name: '生抽', amount: '2勺' },
          { name: '老抽', amount: '半勺' },
          { name: '盐', amount: '适量' },
          { name: '食用油', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '粉条提前用温水泡软',
          '白菜帮和叶分开切，五花肉切片',
          '锅中热油，爆香蒜末和干辣椒',
          '放入五花肉煸炒出油',
          '加入白菜帮翻炒至微软',
          '加入泡好的粉条和白菜叶',
          '加生抽、老抽、盐调味，加少许水炖煮5分钟',
        ]),
        tips: '白菜帮和叶分开下锅，保证口感一致。粉条泡软后再炖不容易糊。',
      },
      {
        name: '肉沫茄子',
        category_id: 1,
        difficulty: 2,
        cook_time: '20分钟',
        dish_type: '半荤半素',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20eggplant%20with%20minced%20pork%2C%20glossy%20purple%20eggplant%20slices%20with%20savory%20meat%20sauce%2C%20garnished%20with%20green%20onions%2C%20served%20in%20a%20white%20bowl%2C%20warm%20lighting%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '茄子', amount: '2根' },
          { name: '猪肉末', amount: '150g' },
          { name: '蒜末', amount: '3瓣' },
          { name: '姜末', amount: '适量' },
          { name: '豆瓣酱', amount: '1勺' },
          { name: '生抽', amount: '2勺' },
          { name: '老抽', amount: '半勺' },
          { name: '糖', amount: '少许' },
          { name: '淀粉水', amount: '适量' },
          { name: '葱花', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '茄子切滚刀块，撒少许盐腌10分钟，挤出水分',
          '锅中多放油，炸茄子至金黄捞出',
          '锅留底油，炒散肉末至变色',
          '加入蒜末姜末爆香，放豆瓣酱炒出红油',
          '加生抽、老抽、糖调味',
          '倒回茄子翻炒均匀，淋入淀粉水勾芡',
          '撒葱花出锅',
        ]),
        tips: '茄子提前腌制可以减少吸油。不喜欢油炸可以用少油煎的方式。',
      },
      {
        name: '凉拌蕨根粉',
        category_id: 1,
        difficulty: 1,
        cook_time: '15分钟',
        dish_type: '素菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20cold%20fernn%20root%20noodles%2C%20dark%20translucent%20noodles%20in%20a%20bowl%20with%20chili%20oil%2C%20crushed%20peanuts%2C%20cilantro%2C%20and%20sesame%20seeds%2C%20vibrant%20colors%2C%20overhead%20shot%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '蕨根粉', amount: '200g' },
          { name: '蒜末', amount: '3瓣' },
          { name: '生抽', amount: '2勺' },
          { name: '香醋', amount: '2勺' },
          { name: '辣椒油', amount: '1勺' },
          { name: '白糖', amount: '半勺' },
          { name: '花生碎', amount: '适量' },
          { name: '香菜', amount: '适量' },
          { name: '香油', amount: '少许' },
        ]),
        steps: JSON.stringify([
          '蕨根粉用开水煮5-8分钟至透明无硬心',
          '捞出过凉水，沥干水分',
          '将蒜末、生抽、香醋、辣椒油、白糖、香油调成酱汁',
          '蕨根粉装盘，淋上酱汁',
          '撒上花生碎和香菜拌匀即可',
        ]),
        tips: '蕨根粉不要煮过头，保持Q弹口感。过凉水是关键步骤。',
      },
      {
        name: '双椒兔丁',
        category_id: 1,
        difficulty: 2,
        cook_time: '20分钟',
        dish_type: '荤菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20spicy%20diced%20rabbit%20with%20green%20and%20red%20peppers%2C%20tender%20rabbit%20meat%20pieces%20with%20vibrant%20green%20and%20red%20chili%20peppers%2C%20sichuan%20style%2C%20in%20a%20wok%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '兔肉', amount: '300g' },
          { name: '青椒', amount: '3个' },
          { name: '红椒', amount: '3个' },
          { name: '花椒', amount: '1勺' },
          { name: '干辣椒', amount: '5个' },
          { name: '蒜', amount: '4瓣' },
          { name: '姜', amount: '3片' },
          { name: '料酒', amount: '1勺' },
          { name: '生抽', amount: '2勺' },
          { name: '淀粉', amount: '适量' },
          { name: '盐', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '兔肉切小丁，加料酒、生抽、淀粉腌制15分钟',
          '青红椒切小块，蒜切末，姜切片',
          '锅中宽油烧热，滑入兔丁快速翻炒至变色盛出',
          '锅留底油，爆香花椒、干辣椒、姜蒜',
          '放入青红椒翻炒断生',
          '倒回兔丁，加盐和生抽调味，大火翻炒均匀',
        ]),
        tips: '兔肉要大火快炒保持嫩滑，腌制时加少许油可以锁住水分。',
      },
      {
        name: '酸辣土豆丝',
        category_id: 1,
        difficulty: 1,
        cook_time: '15分钟',
        dish_type: '素菜',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20food%20photography%20of%20Chinese%20hot%20and%20sour%20shredded%20potatoes%2C%20thin%20crispy%20potato%20straws%20with%20dried%20chili%20peppers%20and%20Sichuan%20peppercorns%2C%20garnished%20with%20green%20onions%2C%20vibrant%20colors%2C%20food%20photography&image_size=landscape_4_3',
        ingredients: JSON.stringify([
          { name: '土豆', amount: '2个' },
          { name: '干辣椒', amount: '5个' },
          { name: '花椒', amount: '1勺' },
          { name: '蒜末', amount: '3瓣' },
          { name: '白醋', amount: '2勺' },
          { name: '盐', amount: '适量' },
          { name: '食用油', amount: '适量' },
        ]),
        steps: JSON.stringify([
          '土豆去皮切细丝，泡入清水中洗去淀粉',
          '捞出沥干水分',
          '锅中热油，爆香花椒和干辣椒',
          '放入土豆丝大火快炒2-3分钟',
          '加盐和白醋调味，翻炒均匀即可出锅',
        ]),
        tips: '土豆丝泡水去除多余淀粉口感更脆爽。大火快炒是关键，不要炒太久。',
      },
    ];

    for (const recipe of sampleRecipes) {
      await db.execute(
        `INSERT INTO recipes (name, category_id, difficulty, cook_time, cover_image, ingredients, steps, tips, dish_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.name, recipe.category_id, recipe.difficulty, recipe.cook_time,
          recipe.cover_image, recipe.ingredients, recipe.steps, recipe.tips,
          (recipe as any).dish_type || '荤菜',
        ]
      );
    }
  }
}
