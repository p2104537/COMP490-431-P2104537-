document.addEventListener('DOMContentLoaded', () => {
    // 添加这个resize处理函数
    function handleResize() {
        const canvas = document.getElementById('fractalCanvas');
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // 保持画布为正方形
        canvas.width = containerWidth;
        canvas.height = containerWidth;
    }

    // 添加resize事件监听
    window.addEventListener('resize', handleResize);
    
    // 初始调用一次
    handleResize();

    const canvas = document.getElementById('fractalCanvas');
    const ifsGen = new IFSGenerator(canvas);
    const lsysGen = new LSystemGenerator(canvas);
    const randomGen = new RandomFractalGenerator(canvas);

    // 获取所有输入元素
    const ifsScale = document.getElementById('ifs-scale');
    const ifsIterations = document.getElementById('ifs-iterations');
    const ifsType = document.getElementById('ifs-type');
    
    const branchLength = document.getElementById('branch-length');
    const branchAngle = document.getElementById('branch-angle');
    const plantType = document.getElementById('plant-type');
    
    const roughness = document.getElementById('roughness');
    const randomType = document.getElementById('random-type');

    // 添加IFS类型切换事件监听器
    document.getElementById('ifs-type').addEventListener('change', (e) => {
        // 隐藏所有参数组
        document.querySelectorAll('.sierpinski-params, .barnsley-params, .carpet-params').forEach(el => {
            el.style.display = 'none';
        });
        // 显示当前选中类型的参数组
        const selectedParams = document.querySelector(`.${e.target.value}-params`);
        if (selectedParams) {
            selectedParams.style.display = 'block';
        }
    });

    // 初始化时触发一次change事件显示默认参数
    document.getElementById('ifs-type').dispatchEvent(new Event('change'));

    // 更新显示值
    function updateValue(input) {
        const valueDisplay = input.parentElement.querySelector('.value');
        if(valueDisplay) {
            valueDisplay.textContent = input.value;
        }
    }

    // 为所有range输入添加事件监听器
    document.querySelectorAll('input[type="range"]').forEach(input => {
        let timeout;
        input.addEventListener('input', () => {
            updateValue(input);
            
            // 添加防抖处理（300ms延迟）
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // 自动触发生成逻辑
                document.getElementById('generate-btn').click();
            }, 300);
        });
    });

    // 当前选中的方法
    let currentMethod = 'ifs';

    // 方法选择按钮事件
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentMethod = btn.dataset.method;
            document.querySelectorAll('.method-panel').forEach(panel => panel.classList.add('hidden'));
            document.getElementById(`${btn.dataset.method}-panel`).classList.remove('hidden');
            if(btn.dataset.method === 'lsystem') {
                document.getElementById('plant-type').dispatchEvent(new Event('change'));
            }
        });
    });

    document.getElementById('plant-type').addEventListener('change', () => {
        if(currentMethod === 'lsystem') {
            const branchAngle = document.getElementById('branch-angle');
            const plantType = document.getElementById('plant-type').value;

            const angleMap = {
                'Fractal Tree': 30,
                'Koch Snowflake': 60,
                'Dragon Curve': 90
            };
            
            branchAngle.value = angleMap[plantType];
            branchAngle.parentElement.querySelector('.value').textContent = angleMap[plantType];
        }
    });

    document.getElementById('plant-type').addEventListener('change', function() {
        const growthLevelInput = document.getElementById('growth-level');
        const valueSpan = growthLevelInput.nextElementSibling;
        
        switch(this.value) {
            case 'Fractal Tree':
                growthLevelInput.max = 12;
                break;
            case 'Koch Snowflake':
                growthLevelInput.max = 8;
                // 如果当前值超过新上限则重置
                if(growthLevelInput.value > 8) {
                    growthLevelInput.value = 8;
                    valueSpan.textContent = 8;
                }
                break;
            case 'Dragon Curve':
                growthLevelInput.max = 20;
                break;
        }
    });
    

    // 生成按钮事件
    document.getElementById('generate-btn').addEventListener('click', () => {
        
        switch(currentMethod) {
            case 'ifs':
                const type = document.getElementById('ifs-type').value;
                const scale = parseFloat(document.getElementById('ifs-scale').value);
                let ifsParams = { scale };

                switch(type) {
                    case 'sierpinski':
                        ifsParams.pointSize = parseFloat(document.getElementById('sierpinski-point-size').value);
                        ifsParams.iterations = parseInt(document.getElementById('sierpinski-iterations').value);
                        break;
                    case 'barnsley':
                        ifsParams.pointSize = parseFloat(document.getElementById('barnsley-point-size').value);
                        ifsParams.iterations = parseInt(document.getElementById('barnsley-iterations').value);
                        break;
                    case 'carpet':
                        ifsParams.depth = parseInt(document.getElementById('carpet-depth').value);
                        break;
                }
                ifsGen.draw(type, ifsParams);
                break;

            case 'lsystem':
                const lsystemParams = {
                    branchLength: parseFloat(document.getElementById('branch-length').value),
                    branchAngle: parseFloat(document.getElementById('branch-angle').value),
                    branchWidth: parseFloat(document.getElementById('branch-width').value),
                    growthLevel: parseInt(document.getElementById('growth-level').value)
                };
                const plantType = document.getElementById('plant-type').value;
                lsysGen.generatePlant(plantType, lsystemParams);
                break;

            case 'random':
                const randomParams = {
                    roughness: parseFloat(document.getElementById('roughness').value),
                    detailLevel: parseInt(document.getElementById('detail-level').value),
                    heightScale: parseFloat(document.getElementById('height-scale').value),
                    frequency: parseInt(document.getElementById('frequency').value)
                };
                const randomType = document.getElementById('random-type').value;
                randomGen.generate(randomType, randomParams);
                break;
        }
    });

    // 重置按钮事件
    document.getElementById('reset-btn').addEventListener('click', () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 重置所有输入值到默认值
        document.querySelectorAll('input[type="range"]').forEach(input => {
            input.value = input.defaultValue;
            input.nextElementSibling.textContent = input.defaultValue;
        });
       
        document.getElementById('plant-type').dispatchEvent(new Event('change'));
    });
    
});
