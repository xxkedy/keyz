# Appz Windows Launcher (v11.1)

Appz の REC / BEAT / MIX は Mac / Windows 共通ボタン。
OS判定は Appz 側が行い、起動方式だけ切り替わる。

```
REC / BEAT / MIX
        |
   launchDAW(mode)
        |
   +----+----------------------------+
   |                                 |
 Mac: shortcuts://run-shortcut     Windows: appz://rec | appz://beat | appz://mix
```

| mode | DAW |
|------|-----|
| `appz://rec`  | Cubase 12 |
| `appz://beat` | FL Studio（インストール済みの最新版を自動検出） |
| `appz://mix`  | Cubase 12 |

## セットアップ（1回だけ・管理者権限不要）

PowerShell をこのフォルダで開いて 1 行：

```
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 setup
```

setup がやること：

1. Cubase / FL Studio の実行ファイルを自動検出（レジストリ + Program Files を実測）
2. `%LOCALAPPDATA%\Appz\daw-paths.json` に保存（**repoには入らない**）
3. `appz-launcher.ps1` を `%LOCALAPPDATA%\Appz\` にコピー
4. `HKCU:\Software\Classes\appz` に `appz://` を登録（**HKCUのみ / HKLMは触らない**）
5. レジストリを読み戻して確認し、rec / beat / mix と不正mode を dry-run 検証（DAWは起動しない）

自動検出に失敗した場合はパスを直接指定：

```
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 setup -Cubase "C:\...\Cubase12.exe" -FLStudio "C:\...\FL64.exe"
```

## 状態確認 / 解除

```
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 status
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 uninstall
```

`uninstall` は `HKCU:\Software\Classes\appz` を削除するだけ。DAW設定は一切変更しない。

## 安全設計

- 受け付ける mode は `rec` / `beat` / `mix` の3つだけ。他は**何も起動しない**（exit 3）。
- URL は `^appz://[A-Za-z]+/?$` の完全一致のみ。引数の注入は不可。
- DAW には**引数を渡さない** = `.cpr` / `.flp` を自動で開かない。
- HKLM・DAW設定・外部ドライブのデータは触らない。
- 個人の絶対パスは `%LOCALAPPDATA%` にのみ保存。repo には `daw-paths.template.json` だけ。
- ログ： `%LOCALAPPDATA%\Appz\launcher.log`

## 手動テスト（DAWを起動しない）

```
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-launcher.ps1 "appz://rec"  -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-launcher.ps1 "appz://beat" -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-launcher.ps1 "appz://mix"  -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-launcher.ps1 "appz://oops" -DryRun
```

## Mac 側

Appz 側は既存方式を維持（`shortcuts://run-shortcut?name=Appz%20REC`）。
ショートカットアプリで以下3つを作成し、アクションは「アプリを開く」だけ：

- `Appz REC` → Cubase 12
- `Appz BEAT` → FL Studio
- `Appz MIX` → Cubase 12
