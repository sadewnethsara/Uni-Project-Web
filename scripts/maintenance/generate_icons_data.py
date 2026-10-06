import os

icons_dir = "public/icons"
output_file = "src/lib/iconsData.ts"

if not os.path.exists(icons_dir):
    print("public/icons directory not found!")
    exit(1)

mapping = {}

for folder in sorted(os.listdir(icons_dir)):
    folder_path = os.path.join(icons_dir, folder)
    if os.path.isdir(folder_path):
        svg_file = f"{folder}.svg"
        svg_path = os.path.join(folder_path, svg_file)
        if os.path.exists(svg_path):
            mapping[folder] = f"/icons/{folder}/{svg_file}"

content = f"""// Auto-generated mapping of all local SVG icons
export const LOCAL_ICONS: Record<string, string> = {repr(mapping)};

export function getLocalIcon(id: string, fallback = "/icons/generic-plant/generic-plant.svg"): string {{
  const key = id.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  return LOCAL_ICONS[key] || fallback;
}}
"""

# Format as TS representation
content = content.replace("': '", "': \"").replace("', '", "\", \"").replace("{'", "{\n  \"").replace("'}", "\"\n}").replace("\", '", "\",\n  \"").replace("': \"", "\": \"").replace("\", \"", "\",\n  \"").replace("\n}", "\n  ").replace("};", "\n};")

with open(output_file, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated {len(mapping)} icon mappings inside {output_file}")
