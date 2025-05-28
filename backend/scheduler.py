import schedule
import time
import os
import django

# ✅ Corrige o path de settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# ✅ Agora os apps Django funcionam normalmente
from apps.chamados.services.analista import verificar_e_encerrar_chamados_inativos

def tarefa_agendada():
    print("[SCHEDULER] Executando autoencerramento...")
    verificar_e_encerrar_chamados_inativos()

schedule.every(1).minutes.do(tarefa_agendada)

if __name__ == "__main__":
    print("[SCHEDULER] Iniciado...")
    while True:
        schedule.run_pending()
        time.sleep(1)
