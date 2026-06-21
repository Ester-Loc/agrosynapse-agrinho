/**
 * 🛠️ MOTOR LOGÍSTICO AGROSYNAPSE PRO
 * Soluções Avançadas de Simulação Interativa - Agrinho 2026
 * Desenvolvedoras Oficiais Fixas: Ester Locatelli & Amanda Groff
 */

document.addEventListener('DOMContentLoaded', () => {
    AppRouter.init();
    AppAccessibility.init();
    AgroEngine.init();
    UserProfile.init();
});

/**
 * 1. NAVEGAÇÃO ENTRE ABAS NATIVA (SPA)
 */
const AppRouter = (() => {
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    const views = document.querySelectorAll('.app-view');
    const shortcutBtn = document.querySelector('.btn-shortcut');

    const init = () => {
        links.forEach(link => {
            link.addEventListener('click', () => {
                const targetViewId = link.getAttribute('data-target');
                switchView(targetViewId);
            });
        });

        if (shortcutBtn) {
            shortcutBtn.addEventListener('click', () => {
                const target = shortcutBtn.getAttribute('data-jump');
                switchView(target);
            });
        }
    };

    const switchView = (viewId) => {
        views.forEach(view => view.classList.remove('active'));
        links.forEach(link => link.classList.remove('active'));

        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');

        const activeLink = document.querySelector(`[data-target="${viewId}"]`);
        if (activeLink) activeLink.classList.add('active');
    };

    return { init, switchView };
})();

/**
 * 2. PERSONALIZAÇÃO DE PERFIL DO VISITANTE
 */
const UserProfile = (() => {
    const init = () => {
        const trigger = document.getElementById('trigger-perfil-modal');
        const modal = document.getElementById('modal-perfil');
        const btnSalvar = document.getElementById('btn-salvar-perfil');
        const btnFechar = document.getElementById('btn-fechar-perfil');

        if (trigger && modal) {
            trigger.addEventListener('click', () => modal.classList.remove('hidden'));
            btnFechar.addEventListener('click', () => modal.classList.add('hidden'));

            btnSalvar.addEventListener('click', () => {
                const nome = document.getElementById('edit-nome').value.trim() || "Visitante";
                const tipoPerfil = document.getElementById('edit-perfil-tipo').value;

                document.getElementById('perf-nome').innerText = nome.length > 20 ? nome.substring(0, 17) + '...' : nome;
                document.getElementById('perf-tipo').innerText = tipoPerfil;
                document.getElementById('perf-inicial').innerText = nome.substring(0, 2).toUpperCase();

                modal.classList.add('hidden');
            });
        }
    };

    return { init };
})();

/**
 * 3. ENGINE DE CÁLCULO E AGREGADOR DE DADOS REGIONAIS
 */
const AgroEngine = (() => {
    const init = () => {
        const cultura = document.getElementById('input-cultura');
        const distancia = document.getElementById('range-distancia');
        const distanciaVal = document.getElementById('val-distancia');
        const toneladas = document.getElementById('input-toneladas');
        const transporte = document.getElementById('select-transporte');
        const focoProblema = document.getElementById('select-problema');
        const btnProcessar = document.getElementById('btn-processar');
        const regiaoSelect = document.getElementById('select-no-regiao');

        const emptyState = document.getElementById('empty-state');
        const content = document.getElementById('analytics-content');
        const rating = document.getElementById('output-rating');
        const outCo2 = document.getElementById('out-co2');
        const outAgua = document.getElementById('out-agua');
        const barCo2 = document.getElementById('bar-co2');
        const barAgua = document.getElementById('bar-agua');
        const pTitle = document.getElementById('problem-title');
        const diagnostico = document.getElementById('out-diagnostico');

        const dashValAgua = document.getElementById('dash-val-agua');
        const dashTrendAgua = document.getElementById('dash-trend-agua');
        const dashBarAgua = document.getElementById('dash-bar-agua');

        // Estrutura de dados por região para simulação local
        const multiplicadoresRegioes = {
            sul: { eficienciaAgua: "92.4%", trend: "+14.2%", fatorClima: 1.0, barWidth: "92.4%" },
            sudeste: { eficienciaAgua: "86.1%", trend: "+8.5%", fatorClima: 1.15, barWidth: "86.1%" },
            'centro-oeste': { eficienciaAgua: "79.3%", trend: "-2.1%", fatorClima: 1.35, barWidth: "79.3%" },
            nordeste: { eficienciaAgua: "94.8%", trend: "+19.0%", fatorClima: 0.85, barWidth: "94.8%" },
            norte: { eficienciaAgua: "81.0%", trend: "+1.2%", fatorClima: 1.20, barWidth: "81.0%" }
        };

        if (distancia) {
            distancia.addEventListener('input', (e) => {
                distanciaVal.innerText = e.target.value;
            });
        }

        if (regiaoSelect) {
            regiaoSelect.addEventListener('change', (e) => {
                const dados = multiplicadoresRegioes[e.target.value];
                if (dados) {
                    dashValAgua.innerText = dados.eficienciaAgua;
                    dashTrendAgua.innerText = dados.trend;
                    dashTrendAgua.className = dados.trend.includes('-') ? "trend negative" : "trend positive";
                    dashBarAgua.style.width = dados.barWidth;
                }
            });
        }

        if (btnProcessar) {
            btnProcessar.addEventListener('click', () => {
                const vol = parseFloat(toneladas.value);
                const dist = parseFloat(distancia.value);

                if (isNaN(vol) || vol <= 0) {
                    alert('Por favor, defina um volume de carga válido.');
                    return;
                }

                const optCultura = cultura.options[cultura.selectedIndex];
                const optTransporte = transporte.options[transporte.selectedIndex];
                const problemaAtivo = focoProblema.value;
                const regiaoAtiva = regiaoSelect ? regiaoSelect.value : 'sul';

                const pegadaAguaBase = parseFloat(optCultura.getAttribute('data-agua'));
                const pegadaCarbonoBase = parseFloat(optCultura.getAttribute('data-carbono'));
                const fLogistico = parseFloat(optTransporte.getAttribute('data-fator'));

                const fClima = multiplicadoresRegioes[regiaoAtiva] ? multiplicadoresRegioes[regiaoAtiva].fatorClima : 1.0;

                // Algoritmos Ambientais Proporcionais
                const totalKg = vol * 1000;
                const totalAguaMilhoes = (totalKg * pegadaAguaBase * fClima) / 1000000;
                const emCo2 = ((totalKg * pegadaCarbonoBase) + (fLogistico * dist * vol)) / 1000;

                emptyState.classList.add('hidden');
                content.classList.remove('hidden');

                outCo2.innerText = emCo2.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
                outAgua.innerText = totalAguaMilhoes.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

                let badgeClass = 'success';
                let badgeText = 'Equilibrado';
                let textoResolucao = '';

                // Geração de relatórios com base no foco selecionado
                if (problemaAtivo === 'carbono') {
                    pTitle.innerText = '📊 Pegada de Carbono Atmosférica';
                    if (emCo2 < 15) {
                        badgeClass = 'success';
                        badgeText = 'Baixo Impacto';
                        textoResolucao = `Sua pegada de ${emCo2.toFixed(1)}t de CO₂ atende aos padrões de equilíbrio sustentável. O circuito logístico impede sobrecargas de poluição na comunidade urbana.`;
                    } else {
                        badgeClass = 'danger';
                        badgeText = 'Alta Emissão';
                        textoResolucao = `Atenção! Esse arranjo de distribuição emite ${emCo2.toFixed(1)}t de CO₂. Para mitigar, tente reduzir a distância focando em mercados locais ou mudando a frota para biocombustíveis.`;
                    }
                }
                else if (problemaAtivo === 'agua') {
                    pTitle.innerText = '💧 Relatório de Balanço Hídrico';
                    if (totalAguaMilhoes < 5) {
                        badgeClass = 'success';
                        badgeText = 'Consumo Controlado';
                        textoResolucao = `Uso responsável de recursos hídricos (${totalAguaMilhoes.toFixed(2)}M de litros). O bioma regional não sofre estresse severo.`;
                    } else {
                        badgeClass = 'warning';
                        badgeText = 'Alto Consumo';
                        textoResolucao = `Essa cultura demanda ${totalAguaMilhoes.toFixed(2)}M de litros de água doce. Para agricultores, técnicas de gotejamento de precisão reduziriam essa pegada em até 25%.`;
                    }
                }
                else if (problemaAtivo === 'desperdicio') {
                    pTitle.innerText = '🚚 Perda de Alimentos por Deslocamento Longo';
                    const perdaEstimadaKg = totalKg * (dist > 400 ? 0.12 : 0.03);
                    if (dist <= 200) {
                        badgeClass = 'success';
                        badgeText = 'Circuito Seguro';
                        textoResolucao = `Com apenas ${dist}km, a quebra de estoque estimada é de apenas ~${perdaEstimadaKg.toFixed(0)}kg. Perfeito para garantir comida fresca sem desperdício na comunidade urbana.`;
                    } else {
                        badgeClass = 'danger';
                        badgeText = 'Risco de Perda';
                        textoResolucao = `A distância excessiva fará com que cerca de ${perdaEstimadaKg.toFixed(0)}kg de alimentos estraguem no trajeto. Produtores devem priorizar mercados locais ou frotas climatizadas.`;
                    }
                }

                rating.className = `badge-status ${badgeClass}`;
                rating.innerText = badgeText;
                diagnostico.innerText = textoResolucao;

                setTimeout(() => {
                    barCo2.style.width = `${Math.min((emCo2 / 45) * 100, 100)}%`;
                    barAgua.style.width = `${Math.min((totalAguaMilhoes / 12) * 100, 100)}%`;
                }, 40);
            });
        }
    };

    return { init };
})();

/**
 * 4. INTERFACES DE ACESSIBILIDADE INTEGRADA
 */
const AppAccessibility = (() => {
    const init = () => {
        const trigger = document.getElementById('a11y-toggle');
        const menu = document.getElementById('a11y-menu');
        const themeBtn = document.getElementById('theme-switcher');
        const fontUp = document.getElementById('font-up');
        const fontDown = document.getElementById('font-down');
        const ttsBtn = document.getElementById('screen-reader-sim');

        if (trigger && menu) {
            trigger.addEventListener('click', () => {
                const isOpen = menu.classList.toggle('open');
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                if (isLight) {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            });
        }

        let currentScale = 100;
        if (fontUp && fontDown) {
            fontUp.addEventListener('click', () => {
                if (currentScale < 120) {
                    currentScale += 5;
                    document.documentElement.style.setProperty('--font-base-size', `${currentScale / 100}rem`);
                }
            });
            fontDown.addEventListener('click', () => {
                if (currentScale > 90) {
                    currentScale -= 5;
                    document.documentElement.style.setProperty('--font-base-size', `${currentScale / 100}rem`);
                }
            });
        }

        if (ttsBtn) {
            ttsBtn.addEventListener('click', () => {
                const targetText = document.querySelector('.app-view.active .tts-text');
                if (targetText && 'speechSynthesis' in window) {
                    if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel();
                        return;
                    }
                    const speakInstance = new SpeechSynthesisUtterance(targetText.innerText);
                    speakInstance.lang = 'pt-BR';
                    window.speechSynthesis.speak(speakInstance);
                }
            });
        }
    };

    return { init };
})();