"""Lee la tasa oficial del dólar (y del euro) publicada por el Banco Central de Venezuela en bcv.org.ve
y la guarda en tasa.json, con su «Fecha Valor». Solo escribe si encuentra datos válidos; si falla, deja el archivo anterior."""
import json, re, sys, datetime, html
src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
def rate(div_id):
    m = re.search(r'id="%s".*?<strong>\s*([\d.,]+)\s*</strong>' % div_id, src, re.S)
    if not m: return None
    v = m.group(1).strip().replace('.', '').replace(',', '.')
    try: return round(float(v), 8)
    except ValueError: return None
usd, eur = rate('dolar'), rate('euro')
m = re.search(r'Fecha Valor:.*?content="([^"]+)"', src, re.S) or re.search(r'class="date-display-single"[^>]*content="([^"]+)"', src, re.S)
fecha = m.group(1)[:10] if m else None
mt = re.search(r'Fecha Valor:.*?>([^<]+)</span>', src, re.S)
texto = html.unescape(mt.group(1)).strip() if mt else None
if not usd or usd <= 0:
    print('ERROR: no encontré la tasa del dólar en la página del BCV'); sys.exit(1)
try: old = json.load(open('tasa.json'))
except Exception: old = {}
hist = old.get('historial', [])
if fecha and (not hist or hist[-1].get('fecha') != fecha):
    hist.append({'fecha': fecha, 'usd': usd})
elif hist and hist[-1].get('fecha') == fecha:
    hist[-1]['usd'] = usd
out = {'usd': usd, 'eur': eur, 'fecha_valor': fecha, 'fecha_texto': texto, 'fuente': 'Banco Central de Venezuela · bcv.org.ve',
       'actualizado': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'historial': hist[-60:]}
same = {k: old.get(k) for k in ('usd', 'eur', 'fecha_valor')} == {k: out[k] for k in ('usd', 'eur', 'fecha_valor')}
if same:
    print('Sin cambios:', usd, fecha); sys.exit(0)
json.dump(out, open('tasa.json', 'w'), ensure_ascii=False, indent=1)
print('OK', usd, eur, fecha)
