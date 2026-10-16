<template>
  <div class="card overflow-hidden">
    <!-- Day headers -->
    <div class="grid grid-cols-7 bg-navy">
      <div
        v-for="d in dayNames"
        :key="d"
        class="text-center py-3 text-[11px] font-semibold text-white/50 tracking-widest uppercase"
      >
        {{ d }}
      </div>
    </div>

    <!-- Cells -->
    <div class="grid grid-cols-7">
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="min-h-[110px] border-r border-b border-gray-100 p-1.5 last:border-r-0 transition-colors"
        :class="{
          'bg-gray-50/60': !cell.currentMonth,
          'bg-accent-light/40': cell.isToday,
          'cursor-pointer hover:bg-accent-light/70':
            cell.currentMonth && cell.events.length,
        }"
        @click="
          cell.currentMonth && cell.events.length && $emit('dayClick', cell)
        "
      >
        <!-- Date number -->
        <div class="flex items-center justify-center w-7 h-7 mb-1 mx-0.5">
          <span
            class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium"
            :class="{
              'bg-accent text-white font-semibold': cell.isToday,
              'text-gray-300': !cell.currentMonth,
              'text-gray-500': cell.currentMonth && !cell.isToday,
            }"
            >{{ cell.day }}</span
          >
        </div>

        <!-- Events -->
        <div class="space-y-0.5">
          <div
            v-for="evt in cell.events.slice(0, 3)"
            :key="evt.id"
            class="rounded px-1.5 py-0.5 text-[11px] font-medium truncate leading-5"
            :class="roomClass(evt.room_id)"
            :title="`${evt.jam_mulai} – ${evt.jam_selesai} · ${evt.agenda}`"
          >
            {{ evt.jam_mulai }} {{ evt.agenda }}
          </div>

          <!-- More indicator -->
          <div
            v-if="cell.events.length > 3"
            class="text-[10px] text-gray-400 px-1"
          >
            +{{ cell.events.length - 3 }} lagi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cells: { type: Array, required: true },
  rooms: { type: Array, default: () => [] },
});
defineEmits(["dayClick"]);

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Warna per ruangan (index 1-based sesuai id)
const ROOM_COLORS = [
  "", // index 0 unused
  "bg-accent-light text-accent border-l-2 border-accent", // room_id 1
  "bg-success-light text-success border-l-2 border-success", // room_id 2
  "bg-warn-light text-warn border-l-2 border-warn", // room_id 3
  "bg-purple-50 text-purple-600 border-l-2 border-purple-400", // room_id 4
];

const roomClass = (roomId) => ROOM_COLORS[roomId] || ROOM_COLORS[1];
</script>
